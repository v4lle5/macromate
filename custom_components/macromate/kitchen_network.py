"""Bounded, HA-independent recipe imports and private media preprocessing.

Parsing patterns adapted from Recipe-Manager importer.py/scraper.py, revision
3c6dcba4b84872ac432e1198f6e855d437cfa294. MIT License:
Copyright (c) 2026 thekiwismarthome

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

from __future__ import annotations

import asyncio
import base64
import binascii
import copy
import io
import ipaddress
import json
import math
import posixpath
import re
import socket
import stat
import threading
import time
import warnings
import zipfile
import zlib
from collections import deque
from fractions import Fraction
from urllib.parse import unquote, urljoin, urlsplit

MAX_REDIRECTS = 3
REQUEST_TIMEOUT = 20
CONNECT_TIMEOUT = 5
READ_TIMEOUT = 5
MAX_REQUESTS_PER_MINUTE = 12
MAX_CONCURRENT_REQUESTS = 4
_RATE_TIMES = deque()
_RATE_LOCK = threading.Lock()
_IN_FLIGHT = 0


def _request_rate():
    now = time.monotonic()
    with _RATE_LOCK:
        while _RATE_TIMES and _RATE_TIMES[0] <= now - 60:
            _RATE_TIMES.popleft()
        if len(_RATE_TIMES) >= MAX_REQUESTS_PER_MINUTE:
            raise ValueError("Remote request rate limit")
        _RATE_TIMES.append(now)


async def _read_response(response, limit):
    declared = response.headers.get("Content-Length")
    if declared is not None:
        if not declared.isdecimal() or int(declared) > limit:
            raise ValueError("Remote byte limit")
    encoding = response.headers.get("Content-Encoding", "identity").strip().lower()
    if encoding not in {"", "identity", "gzip", "deflate"}:
        raise ValueError("Unsupported remote content encoding")
    decoder = (
        zlib.decompressobj(16 + zlib.MAX_WBITS if encoding == "gzip" else zlib.MAX_WBITS)
        if encoding in {"gzip", "deflate"}
        else None
    )
    body = bytearray()
    received = 0
    try:
        async for chunk in response.content.iter_chunked(65536):
            received += len(chunk)
            if received > limit:
                raise ValueError("Remote byte limit")
            decoded = decoder.decompress(chunk, limit + 1 - len(body)) if decoder else chunk
            body.extend(decoded)
            if len(body) > limit or (decoder and decoder.unconsumed_tail):
                raise ValueError("Remote decompression limit")
        if decoder and (not decoder.eof or decoder.unused_data):
            raise ValueError("Malformed compressed response")
    except zlib.error:
        raise ValueError("Malformed compressed response") from None
    return bytes(body)


async def _fetch_bytes(url: str, *, enabled: bool, image=False):
    global _IN_FLIGHT
    if enabled is not True:
        raise ValueError("Explicit remote import consent required")
    url = validate_remote_url(url)
    from aiohttp import ClientError, ClientSession, ClientTimeout, DummyCookieJar, TCPConnector

    with _RATE_LOCK:
        if _IN_FLIGHT >= MAX_CONCURRENT_REQUESTS:
            raise ValueError("Remote concurrency limit")
        _IN_FLIGHT += 1
    try:
        async with asyncio.timeout(REQUEST_TIMEOUT):
            # A private connector/session per operation. Neither HA sessions,
            # cookies, .netrc, environment proxies nor auth can reach this client.
            connector = TCPConnector(
                resolver=SafeResolver(),
                socket_factory=_socket_factory,
                use_dns_cache=False,
                force_close=True,
                limit=1,
            )
            try:
                async with ClientSession(
                    connector=connector,
                    cookie_jar=DummyCookieJar(),
                    trust_env=False,
                    auto_decompress=False,
                    timeout=ClientTimeout(
                        total=REQUEST_TIMEOUT,
                        connect=CONNECT_TIMEOUT,
                        sock_connect=CONNECT_TIMEOUT,
                        sock_read=READ_TIMEOUT,
                    ),
                    headers={
                        "User-Agent": "MacroMate/recipe-import",
                        "Accept-Encoding": "identity",
                        "Accept": "image/*" if image else "text/html,application/xhtml+xml",
                    },
                ) as session:
                    for hop in range(MAX_REDIRECTS + 1):
                        validate_remote_url(url)
                        _request_rate()
                        async with session.get(url, allow_redirects=False) as response:
                            if response.status in {301, 302, 303, 307, 308}:
                                location = response.headers.get("Location")
                                if not location or hop == MAX_REDIRECTS:
                                    raise ValueError("Remote redirect limit or missing location")
                                url = validate_remote_url(urljoin(url, location))
                                continue
                            if response.status != 200:
                                raise ValueError("Remote server did not return success")
                            content_type = (
                                response.headers.get("Content-Type", "")
                                .split(";", 1)[0]
                                .strip()
                                .lower()
                            )
                            if (
                                image
                                and content_type
                                not in {
                                    "image/png",
                                    "image/jpeg",
                                    "image/webp",
                                    "image/gif",
                                    "image/bmp",
                                    "application/octet-stream",
                                }
                            ) or (
                                not image
                                and content_type not in {"text/html", "application/xhtml+xml"}
                            ):
                                raise ValueError("Unsupported remote content type")
                            payload = await _read_response(
                                response, MAX_IMAGE_BYTES if image else MAX_HTML_BYTES
                            )
                            return payload, url, response.charset or "utf-8"
            finally:
                await connector.close()
    except (ClientError, OSError, TimeoutError):
        # Never expose secret query parameters, remote HTML or internal IPs.
        raise ValueError("Remote fetch failed or timed out") from None
    finally:
        with _RATE_LOCK:
            _IN_FLIGHT -= 1
    raise ValueError("Remote redirect limit")


async def fetch_recipe(url: str, *, enabled: bool) -> dict:
    """Bounded consented HTTPS retrieval -> pure recipe dictionary."""
    payload, final_url, encoding = await _fetch_bytes(url, enabled=enabled)
    try:
        html = payload.decode(encoding, errors="replace")
    except LookupError:
        raise ValueError("Unsupported remote text encoding") from None
    return await asyncio.to_thread(parse_recipe_html, html, final_url)


async def fetch_image(url: str, *, enabled: bool) -> dict:
    """Bounded consented HTTPS retrieval -> local WebP record, never an URL."""
    payload, _, _ = await _fetch_bytes(url, enabled=enabled, image=True)
    return await asyncio.to_thread(_normalize_image_bytes, payload)


# Block translation/tunnelling ranges too: a global-looking IPv6 address may
# embed a private IPv4 destination, or be routed through a local NAT64 gateway.
_BLOCKED_V6 = tuple(
    ipaddress.ip_network(n)
    for n in ("::/96", "::ffff:0:0/96", "64:ff9b::/96", "64:ff9b:1::/48", "2001::/32", "2002::/16")
)


def _public_ip(value: str):
    try:
        address = ipaddress.ip_address(value)
    except ValueError:
        raise ValueError("Invalid destination IP") from None
    if (
        str(address) == "168.63.129.16"  # Azure host platform/wire server
        or not address.is_global
        or address.is_multicast
        or address.is_unspecified
        or address.is_reserved
        or getattr(address, "scope_id", None)
        or (address.version == 6 and any(address in net for net in _BLOCKED_V6))
    ):
        raise ValueError("Blocked destination IP")
    return address


def validate_remote_url(url: str) -> str:
    """Strict HTTPS/443 without credentials, ambiguous authority or local names."""
    if (
        not isinstance(url, str)
        or len(url) > 8192
        or any(c.isspace() or ord(c) < 32 for c in url)
        or "\\" in url
    ):
        raise ValueError("Invalid remote URL")
    try:
        parsed = urlsplit(url)
        host = parsed.hostname
        if (
            parsed.scheme != "https"
            or not host
            or parsed.username is not None
            or parsed.password is not None
            or parsed.port not in {None, 443}
            or "%" in host
            or parsed.fragment
        ):
            raise ValueError("Invalid remote URL")
        host = host.lower().rstrip(".")
        try:
            address = ipaddress.ip_address(host)
        except ValueError:
            address = None
        if address is not None:
            _public_ip(host)
        else:
            ascii_host = host.encode("idna").decode("ascii")
            if (
                "." not in ascii_host
                or not re.fullmatch(r"[a-z0-9.-]+", ascii_host)
                or ascii_host.endswith(
                    (".localhost", ".local", ".internal", ".home", ".lan", ".test", ".invalid")
                )
                or any(
                    not label or len(label) > 63 or label.startswith("-") or label.endswith("-")
                    for label in ascii_host.split(".")
                )
                or re.fullmatch(r"[0-9.]+", ascii_host)
            ):
                raise ValueError("Blocked remote hostname")
        return url
    except (ValueError, UnicodeError):
        raise ValueError("Invalid or blocked remote URL") from None


class SafeResolver:
    """Resolve only for aiohttp's actual connector; no preflight/check-then-DNS.

    Returned numeric addresses go directly to sockets. Caching is disabled in
    our connector. Mixed public/private DNS answers fail closed as a whole.
    """

    async def resolve(self, host: str, port: int = 443, family: int = socket.AF_UNSPEC):
        validate_remote_url("https://" + ("[" + host + "]" if ":" in host else host))
        if port != 443:
            raise ValueError("Blocked destination port")
        answers = await asyncio.get_running_loop().getaddrinfo(
            host, port, family=family, type=socket.SOCK_STREAM, proto=socket.IPPROTO_TCP
        )
        if not answers:
            raise ValueError("No destination addresses")
        result = []
        for af, _, proto, _, sockaddr in answers:
            _public_ip(sockaddr[0])
            if sockaddr[1] != 443:
                raise ValueError("Blocked destination port")
            result.append(
                {
                    "hostname": host,
                    "host": sockaddr[0],
                    "port": port,
                    "family": af,
                    "proto": proto,
                    "flags": socket.AI_NUMERICHOST,
                }
            )
        return result

    async def close(self):
        return None


def _socket_factory(addr_info):
    family, kind, proto, _, address = addr_info
    _public_ip(address[0])  # enforced at socket creation, including literal-IP URLs
    if address[1] != 443 or family not in {socket.AF_INET, socket.AF_INET6}:
        raise ValueError("Blocked destination")
    return socket.socket(family=family, type=kind, proto=proto)


MAX_ARCHIVE_BYTES = 32 * 1024 * 1024
MAX_ARCHIVE_EXPANSION = 64 * 1024 * 1024
MAX_ARCHIVE_MEMBERS = 512
MAX_ARCHIVE_MEMBER_BYTES = 8 * 1024 * 1024
MAX_ARCHIVE_RATIO = 100


def _archive_name(name: str) -> str:
    if (
        not name
        or len(name) > 512
        or "\\" in name
        or ":" in name
        or name.startswith("/")
        or any(ord(c) < 32 for c in name)
    ):
        raise ValueError("Unsafe archive member path")
    parts = name.rstrip("/").split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise ValueError("Unsafe archive member path")
    return name.rstrip("/")


def parse_recipe_archive(base64_data: str) -> dict:
    """ZIP/.rkeeper -> {recipes: [recipe], media: {member_name: WebP_record}}.

    media keys are validated archive references, NOT filesystem paths or public
    URLs. Recipe photos/image_url/_image_filename refer to matching media keys;
    unmatched references remain inert source data. Parent assigns private media
    IDs, rewrites references, enforces ACLs and persists atomically. All images
    are normalized, including extra archive photos. Never extract to disk.
    """
    data = _decode_base64(base64_data, MAX_ARCHIVE_BYTES)
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            members = archive.infolist()
            if not members or len(members) > MAX_ARCHIVE_MEMBERS:
                raise ValueError("Archive member count limit")
            total = 0
            seen = set()
            for member in members:
                name = _archive_name(member.orig_filename)
                if name.casefold() in seen:
                    raise ValueError("Duplicate archive member")
                seen.add(name.casefold())
                mode = member.external_attr >> 16
                if stat.S_IFMT(mode) not in {0, stat.S_IFREG, stat.S_IFDIR}:
                    raise ValueError("Archive special file or symlink")
                if member.flag_bits & 1 or member.compress_type not in {
                    zipfile.ZIP_STORED,
                    zipfile.ZIP_DEFLATED,
                }:
                    raise ValueError("Unsupported encrypted/compressed archive")
                total += member.file_size
                if (
                    member.file_size > MAX_ARCHIVE_MEMBER_BYTES
                    or total > MAX_ARCHIVE_EXPANSION
                    or member.file_size > max(1, member.compress_size) * MAX_ARCHIVE_RATIO
                ):
                    raise ValueError("Archive expansion limit")
            html_files = [
                m
                for m in members
                if not m.is_dir() and m.filename.lower().endswith((".html", ".htm"))
            ]
            if not html_files:
                raise ValueError("No Recipe Keeper HTML in archive")
            recipes, media = [], {}
            normalized_bytes = 0
            for member in members:
                if member.is_dir():
                    continue
                # CRC is checked even for inert auxiliary members; no extraction.
                with archive.open(member) as stream:
                    payload = stream.read(MAX_ARCHIVE_MEMBER_BYTES + 1)
                    if len(payload) != member.file_size or len(payload) > MAX_ARCHIVE_MEMBER_BYTES:
                        raise ValueError("Archive member size mismatch")
                if member in html_files:
                    if len(payload) > MAX_HTML_BYTES:
                        raise ValueError("HTML byte limit")
                    rows = parse_recipe_keeper(payload.decode("utf-8-sig"))
                    for row in rows:
                        row["provenance"]["archive_member"] = member.filename
                    recipes.extend(rows)
                    if len(recipes) > MAX_RECIPES:
                        raise ValueError("Recipe count limit")
                elif member.filename.lower().endswith(
                    (".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp")
                ):
                    record = _normalize_image_bytes(payload)
                    normalized_bytes += len(record["data"])
                    if normalized_bytes > MAX_ARCHIVE_EXPANSION:
                        raise ValueError("Normalized archive media limit")
                    media[member.filename] = record
            for row in recipes:
                parent = posixpath.dirname(row["provenance"]["archive_member"])

                def reference(ref, parent=parent):
                    if urlsplit(ref).scheme or ref.startswith("//"):
                        return ref  # metadata only, never fetched
                    ref = _archive_name(unquote(ref))
                    relative = posixpath.join(parent, ref) if parent else ref
                    if relative in media:
                        return relative
                    if ref in media:
                        return ref
                    matches = [
                        key for key in media if posixpath.basename(key) == posixpath.basename(ref)
                    ]
                    if len(matches) > 1:
                        raise ValueError("Ambiguous archive image reference")
                    return matches[0] if matches else ref

                row["photos"] = [reference(ref) for ref in row["photos"]]
                row["image_url"] = row["photos"][0] if row["photos"] else None
                row["_image_filename"] = row["image_url"]
            return {"recipes": recipes, "media": media}
    except (zipfile.BadZipFile, OSError, EOFError, UnicodeError, RuntimeError, NotImplementedError):
        raise ValueError("Invalid Recipe Keeper archive") from None


MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_IMAGE_PIXELS = 16_000_000
MAX_IMAGE_DIMENSION = 8192
MAX_WEBP_BYTES = 8 * 1024 * 1024


def _decode_base64(data: str, limit: int, *, image=False) -> bytes:
    if not isinstance(data, str):
        raise ValueError("Expected base64 text")
    if image and data.startswith("data:"):
        prefix, comma, data = data.partition(",")
        if not comma or not re.fullmatch(r"data:image/(?:png|jpeg|webp|gif|bmp);base64", prefix):
            raise ValueError("Unsupported image data URI")
    if len(data) > 4 * ((limit + 2) // 3):
        raise ValueError("Encoded data exceeds limit")
    try:
        decoded = base64.b64decode(data, validate=True)
    except (ValueError, binascii.Error):
        raise ValueError("Invalid base64 data") from None
    if not decoded or len(decoded) > limit:
        raise ValueError("Decoded data exceeds limit")
    return decoded


def _normalize_image_bytes(data: bytes) -> dict:
    from PIL import Image, ImageOps

    if not data or len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Image byte limit")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as image:
                if image.format not in {"JPEG", "PNG", "WEBP", "GIF", "BMP"}:
                    raise ValueError("Unsupported image format")
                if (
                    image.width * image.height > MAX_IMAGE_PIXELS
                    or max(image.size) > MAX_IMAGE_DIMENSION
                ):
                    raise ValueError("Image pixel limit")
                if getattr(image, "n_frames", 1) != 1:
                    raise ValueError("Animated images are not supported")
                image.load()  # real decoding, never pass original encoded bytes through
                oriented = ImageOps.exif_transpose(image)
                pixels = oriented.convert(
                    "RGBA"
                    if "A" in oriented.getbands() or "transparency" in oriented.info
                    else "RGB"
                )
                # Construct a clean image so EXIF/XMP/ICC/text cannot survive.
                clean = Image.new(pixels.mode, pixels.size)
                clean.paste(pixels)
                output = io.BytesIO()
                clean.save(output, format="WEBP", lossless=True, method=4)
                result = output.getvalue()
    except (
        OSError,
        ValueError,
        SyntaxError,
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
    ):
        raise ValueError("Invalid, unsupported or oversized image") from None
    if len(result) > MAX_WEBP_BYTES:
        raise ValueError("Normalized image byte limit")
    return {"data": base64.b64encode(result).decode("ascii"), "content_type": "image/webp"}


def normalize_image(base64_data: str) -> dict:
    """Upload -> decoded, oriented, metadata-free lossless WebP record.

    Static JPEG/PNG/WebP/GIF/BMP only; animation, SVG and undecodable data
    fail closed. No file paths are accepted or created.
    """
    return _normalize_image_bytes(_decode_base64(base64_data, MAX_IMAGE_BYTES, image=True))


MAX_HTML_BYTES = 2 * 1024 * 1024
MAX_HTML_NODES = 30000
MAX_RECIPES = 500


def _soup(html_content: str):
    from bs4 import BeautifulSoup

    if not isinstance(html_content, str) or len(html_content.encode("utf-8")) > MAX_HTML_BYTES:
        raise ValueError("HTML exceeds limit")
    soup = BeautifulSoup(html_content, "html.parser")
    from bs4.element import Tag

    pending = [(soup, 0)]
    nodes = 0
    while pending:
        element, depth = pending.pop()
        nodes += 1
        if nodes > MAX_HTML_NODES or depth > 256:
            raise ValueError("HTML node/depth limit")
        pending.extend((child, depth + 1) for child in element.children if isinstance(child, Tag))
    return soup


def _plain(value) -> str:
    if value is None:
        return ""
    soup = _soup(str(value))
    for element in soup.find_all(["script", "style", "iframe", "object", "svg"]):
        element.decompose()
    return soup.get_text(" ", strip=True)


def _strings(value) -> list[str]:
    if value is None:
        return []
    return [
        _plain(item) for item in (value if isinstance(value, list) else [value]) if item is not None
    ]


def _bounded_measure(value):
    if value is not None and (not math.isfinite(value) or not 0 <= value <= 1_000_000):
        raise ValueError("Recipe numeric declaration exceeds limit")
    return value


def _duration(value):
    if value is None:
        return None
    value = str(value).strip()
    iso = re.fullmatch(
        r"P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?", value, re.I
    )
    if iso and any(iso.groups()):
        return _bounded_measure(
            sum(
                float(v or 0) * factor
                for v, factor in zip(iso.groups(), [1440, 60, 1, 1 / 60], strict=False)
            )
        )
    human = re.fullmatch(
        r"(?:(\d+)\s*h(?:ours?)?\s*(?:and\s*)?)?(?:(\d+)\s*m(?:in(?:ute)?s?)?)?", value, re.I
    )
    if human and any(human.groups()):
        return _bounded_measure(int(human[1] or 0) * 60 + int(human[2] or 0))
    return _bounded_measure(int(value)) if value.isdecimal() else None


def _servings(value):
    text = _strings(value)
    text = text[0] if text else None
    match = re.search(r"\d+(?:\.\d+)?", text or "")
    return _bounded_measure(float(match[0]) if match else None), text


def _steps(value, groups: list, depth=0) -> list[str]:
    if depth > 20:
        raise ValueError("Instruction nesting limit")
    if isinstance(value, str):
        return [_plain(line) for line in value.splitlines() if _plain(line)]
    if isinstance(value, dict):
        if "itemListElement" in value:
            steps = _steps(value["itemListElement"], groups, depth + 1)
            groups.append({"name": _plain(value.get("name")), "instructions": steps})
            return steps
        return _steps(value.get("text", value.get("name", "")), groups, depth + 1)
    if isinstance(value, list):
        return [step for item in value for step in _steps(item, groups, depth + 1)]
    return []


def _json_recipe(soup) -> dict | None:
    for script in soup.find_all(
        "script", attrs={"type": re.compile(r"^application/ld\+json$", re.I)}
    ):
        try:
            data = json.loads(script.string or script.get_text(), parse_constant=lambda _: None)
        except (ValueError, RecursionError):
            continue
        # Validate the WHOLE source tree before returning the first Recipe;
        # otherwise deeply nested auxiliary metadata bypasses the parser walk.
        validation = [(data, 0)]
        count = 0
        while validation:
            value, depth = validation.pop()
            count += 1
            if depth > 30 or count > 10000:
                raise ValueError("JSON-LD nesting/node limit")
            if isinstance(value, float) and not math.isfinite(value):
                raise ValueError("Nonfinite JSON-LD declaration")
            if isinstance(value, dict):
                validation.extend((item, depth + 1) for item in value.values())
            elif isinstance(value, list):
                validation.extend((item, depth + 1) for item in value)
        pending = [(data, 0)]
        count = 0
        while pending:
            node, depth = pending.pop(0)
            count += 1
            if depth > 30 or count > 10000:
                raise ValueError("JSON-LD nesting/node limit")
            if isinstance(node, list):
                pending.extend((item, depth + 1) for item in node)
            elif isinstance(node, dict):
                types = node.get("@type", [])
                types = types if isinstance(types, list) else [types]
                if any(str(t).rsplit("/", 1)[-1] == "Recipe" for t in types) and node.get("name"):
                    return node
                pending.extend(
                    (item, depth + 1) for item in node.values() if isinstance(item, (list, dict))
                )
    return None


def _from_node(node: dict, url: str) -> dict:
    groups = []
    instructions = _steps(node.get("recipeInstructions"), groups)
    servings, servings_text = _servings(node.get("recipeYield", node.get("yield")))
    images = node.get("image", [])
    images = images if isinstance(images, list) else [images]
    photos = [
        urljoin(
            url,
            str(
                image.get("url", image.get("contentUrl", "")) if isinstance(image, dict) else image
            ),
        )
        for image in images
        if image
    ]
    categories, cuisines = _strings(node.get("recipeCategory")), _strings(node.get("recipeCuisine"))
    keywords = node.get("keywords", [])
    keywords = keywords.split(",") if isinstance(keywords, str) else keywords
    rating = node.get("aggregateRating") or {}
    rating = rating.get("ratingValue") if isinstance(rating, dict) else rating
    try:
        rating = float(rating) if rating is not None else None
        if rating is not None and not math.isfinite(rating):
            rating = None
    except (ValueError, TypeError):
        rating = None
    return {
        "name": _plain(node.get("name")),
        "source_url": url,
        "description": _plain(node.get("description")) or None,
        "ingredients": [
            parse_ingredient(_plain(item)) for item in _strings(node.get("recipeIngredient"))
        ],
        "instructions": instructions,
        "instruction_groups": groups,
        "servings": servings,
        "servings_text": servings_text,
        "prep_time": _duration(node.get("prepTime")),
        "cook_time": _duration(node.get("cookTime")),
        "total_time": _duration(node.get("totalTime")),
        "courses": _strings(node.get("recipeCourse")),
        "collections": _strings(node.get("recipeCollection")),
        "categories": categories,
        "category": categories[0] if categories else None,
        "cuisines": cuisines,
        "cuisine": cuisines[0] if cuisines else None,
        "tags": list(
            dict.fromkeys(s.strip().lower() for s in _strings(keywords) + categories if s.strip())
        ),
        "photos": photos,
        "image_url": photos[0] if photos else None,
        "rating": rating,
        "notes": _plain(node.get("notes")) or None,
        "import_metadata": copy.deepcopy(node),
        **parse_nutrition(node.get("nutrition"), basis=node.get("nutrition_basis")),
    }


def parse_recipe_html(html_content: str, url: str) -> dict:
    """Offline recipe-scrapers plus lossless JSON-LD metadata supplementation.

    Photos are references only, NOT downloaded here. The parent must remove
    remote URLs from rendered media and explicitly normalize/store chosen ones.
    import_metadata is inert source data and must never be rendered as markup.
    """
    soup = _soup(html_content)
    node = _json_recipe(soup)
    result = _from_node(node, url) if node else None
    parsers = ["json-ld"] if node else []
    from recipe_scrapers import scrape_html

    try:
        scraper = scrape_html(
            html_content, org_url=url, online=False, supported_only=False, best_image=False
        )

        def safe(name):
            try:
                return getattr(scraper, name)()
            except Exception:
                return None

        title = safe("title")
        if title:
            parsers.append("recipe-scrapers")
            scraper_node = {
                "name": title,
                "description": safe("description"),
                "recipeYield": safe("yields"),
                "recipeIngredient": safe("ingredients"),
                "recipeInstructions": safe("instructions_list") or safe("instructions"),
                "image": safe("image"),
                "recipeCuisine": safe("cuisine"),
                "recipeCategory": safe("category"),
                "keywords": safe("keywords"),
                "nutrition": safe("nutrients"),
            }
            if result is None:
                result = _from_node(scraper_node, url)
                for key in ["prep_time", "cook_time", "total_time"]:
                    result[key] = _bounded_measure(safe(key))
            else:
                supplement = _from_node(scraper_node, url)
                for key, value in supplement.items():
                    if not result.get(key) and key not in {"nutrition_basis", "import_metadata"}:
                        result[key] = value
                result["nutrition"] = {**supplement["nutrition"], **result["nutrition"]}
                result["nutrition_raw"] = {**supplement["nutrition_raw"], **result["nutrition_raw"]}
            ingredient_groups = safe("ingredient_groups") or []
            result["ingredient_groups"] = [
                {
                    "name": _plain(group.purpose),
                    "ingredients": [parse_ingredient(_plain(item)) for item in group.ingredients],
                }
                for group in ingredient_groups
            ]
    except Exception:
        if result is None:
            raise ValueError("No supported recipe metadata found") from None
    if result is None or not result["name"]:
        raise ValueError("No supported recipe metadata found")
    if result.get("ingredient_groups"):
        # The shared recipe domain accepts arbitrary bounded metadata. Keep a
        # storage-compatible copy as well as the convenience parser alias.
        result["metadata"] = {"ingredient_groups": copy.deepcopy(result["ingredient_groups"])}
    result["provenance"] = {"source": "web", "url": url, "parsers": parsers}
    return result


def _element(container, *classes, prop=None):
    if prop:
        found = container.find(attrs={"itemprop": prop})
        if found:
            return found
    for cls in classes:
        found = container.find(class_=re.compile(r"\b" + cls + r"\b", re.I))
        if found:
            return found
    return None


def _element_text(element):
    if element is None:
        return None
    return (element.get("content") or element.get_text("\n", strip=True) or "").strip() or None


def _nutrition_text(text):
    raw = {}
    labels = {
        "calories": "calories",
        "total fat": "fat",
        "fat": "fat",
        "saturated fat": "saturated_fat",
        "trans fat": "trans_fat",
        "cholesterol": "cholesterol",
        "sodium": "sodium",
        "carbohydrates": "carbohydrates",
        "total carbs": "carbohydrates",
        "carbs": "carbohydrates",
        "dietary fiber": "fiber",
        "fiber": "fiber",
        "sugar": "sugar",
        "sugars": "sugar",
        "protein": "protein",
    }
    pattern = (
        r"\b("
        + "|".join(re.escape(label) for label in sorted(labels, key=len, reverse=True))
        + r")\s*[:\-]\s*(\d+(?:[.,]\d+)?\s*(?:kcal|kj|mg|g)?)"
    )
    for match in re.finditer(pattern, text, re.I):
        raw[labels[match[1].lower()]] = match[2].strip()
    return raw


def _declared_basis(text):
    if re.search(r"\bper\s+(?:serving|portion)\b", text, re.I):
        return "per_serving"
    if re.search(r"\b(?:per\s+recipe|whole\s+recipe)\b", text, re.I):
        return "per_recipe"
    return "unknown"


def parse_recipe_keeper(html_content: str) -> list[dict]:
    """Recipe Keeper HTML -> recipes, retaining ALL photo references and notes.

    No executable markup is returned in display fields. _image_filename is a
    compatibility reference; photos/image_url are inert pending local storage.
    Nutrition notes are retained verbatim as text instead of destructively cut.
    """
    soup = _soup(html_content)
    for element in soup.find_all(["script", "style", "iframe", "object", "svg"]):
        element.decompose()
    containers = soup.find_all(class_="recipe-details")
    if not containers:
        candidates = [
            el
            for el in soup.find_all(["article", "section", "div"])
            if el.find(class_=re.compile(r"\brecipe-name\b", re.I))
        ]
        containers = [
            el
            for el in candidates
            if not any(child in candidates for child in el.find_all(["article", "section", "div"]))
        ]
    if not containers or len(containers) > MAX_RECIPES:
        raise ValueError("Invalid Recipe Keeper containers/count")
    recipes = []
    for container in containers:

        def text(*classes, prop=None, container=container):
            return _element_text(_element(container, *classes, prop=prop))

        name = text("recipe-name", prop="name") or _element_text(container.find(["h2", "h3", "h1"]))
        if not name:
            raise ValueError("Recipe Keeper recipe has no name")
        node = {
            "name": name,
            "description": text("recipe-description", prop="description"),
            "recipeYield": text(
                "recipe-serving-size", "recipe-yield", "recipe-servings", prop="recipeYield"
            ),
            "prepTime": text("recipe-prep-time", "recipe-preptime", prop="prepTime"),
            "cookTime": text("recipe-cook-time", "recipe-cooktime", prop="cookTime"),
            "totalTime": text("recipe-total-time", "recipe-totaltime", prop="totalTime"),
            "recipeCuisine": text("recipe-cuisine", prop="recipeCuisine"),
            "notes": text("recipe-notes", "recipe-note"),
        }
        for key, classes in [
            ("recipeCourse", ("recipe-course", "recipe-courses")),
            ("recipeCategory", ("recipe-category", "recipe-categories")),
            ("recipeCollection", ("recipe-collection", "recipe-collections")),
        ]:
            vals = [_element_text(el) for el in container.find_all(attrs={"itemprop": key})]
            node[key] = [v for v in vals if v] or [
                v.strip() for v in re.split(r"[,;/]", text(*classes) or "") if v.strip()
            ]
        source = _element(
            container, "recipe-source", "recipe-url", "recipe-source-url", prop="recipeSource"
        )
        anchor = (
            source
            if source is not None and source.name == "a"
            else source.find("a")
            if source
            else None
        )
        source_url = anchor.get("href") if anchor else _element_text(source)
        ing = _element(
            container,
            "recipe-ingredients?",
            "p-ingredients?",
            "ingredient-list",
            "ingredients-list",
            prop="recipeIngredients",
        )
        if ing:
            items = ing.find_all("li") or ing.find_all("p") or ing.find_all("span")
            node["recipeIngredient"] = (
                [_element_text(el) for el in items]
                if items
                else ing.get_text("\n", strip=True).splitlines()
            )
        else:
            node["recipeIngredient"] = [
                _element_text(el)
                for el in container.find_all(attrs={"itemprop": "recipeIngredient"})
            ]
        method = _element(
            container,
            "recipe-method-directions",
            "recipe-method",
            "recipe-directions?",
            "recipe-instructions?",
            "recipe-steps?",
            "e-instructions?",
            "directions?-list",
            "steps?-list",
            "method",
            "directions?",
            prop="recipeDirections",
        )
        if method is None:
            method = _element(container, prop="recipeInstructions")
        if method is None:
            method = next(
                (
                    el
                    for el in container.find_all(["ol", "ul"])
                    if el is not ing
                    and (ing is None or el not in ing.descendants)
                    and el.find("li")
                    and len(el.find("li").get_text(strip=True)) > 10
                ),
                None,
            )
        if method:
            items = method.find_all("li") or method.find_all("p")
            lines = (
                [_element_text(el) for el in items]
                if items
                else method.get_text("\n", strip=True).splitlines()
            )
            node["recipeInstructions"] = [
                re.sub(r"^(?:Step\s*)?\d+[.):\s]+", "", line or "", flags=re.I).strip()
                for line in lines
            ]
        photos = [
            el
            for el in container.find_all("img")
            if "recipe-photo" in el.get("class", [])
            or el.find_parent(class_="recipe-photo") is not None
            or not re.search(r"logo|icon|banner", el.get("src", ""), re.I)
        ]
        node["image"] = [
            el.get("src") or el.get("data-src")
            for el in photos
            if el.get("src") or el.get("data-src")
        ]
        nutr = _element(container, "recipe-nutrition", prop="nutrition")
        raw = {}
        if nutr:
            for el in nutr.find_all(["li", "span", "p", "td", "div"]):
                label, colon, value = el.get_text(" ", strip=True).partition(":")
                if colon:
                    raw[label.strip()] = value.strip()
            raw.update(_nutrition_text(nutr.get_text("\n", strip=True)))
        if not raw:
            raw.update(_nutrition_text(node.get("notes") or ""))
        for prop in _NUTRIENTS:
            val = text(prop=prop)
            if val is not None:
                raw[prop] = val
        serving_size = text(prop="servingSize")
        if serving_size:
            raw["servingSize"] = serving_size
        node["nutrition"] = raw
        basis = container.get("data-nutrition-basis")
        node["nutrition_basis"] = basis or (
            "per_serving"
            if serving_size
            else _declared_basis(
                (nutr.get_text(" ", strip=True) if nutr else "") + " " + (node.get("notes") or "")
            )
        )
        rating = text("recipe-rating", prop="ratingValue")
        node["aggregateRating"] = {"ratingValue": rating}
        row = _from_node(node, "")
        for field, classes in [
            ("prep_time", ("recipe-prep-time", "recipe-preptime")),
            ("cook_time", ("recipe-cook-time", "recipe-cooktime")),
            ("total_time", ("recipe-total-time", "recipe-totaltime")),
        ]:
            if row[field] is None:
                row[field] = _duration(text(*classes))
        row.update(
            source_url=source_url,
            _image_filename=row["image_url"],
            provenance={"source": "recipe_keeper", "parsers": ["beautifulsoup4"]},
        )
        recipes.append(row)
    return recipes


_NUTRIENTS = {
    "calories": "calories",
    "fatContent": "fat",
    "proteinContent": "protein",
    "carbohydrateContent": "carbohydrates",
    "saturatedFatContent": "saturated_fat",
    "transFatContent": "trans_fat",
    "cholesterolContent": "cholesterol",
    "sodiumContent": "sodium",
    "fiberContent": "fiber",
    "sugarContent": "sugar",
}
_NUTRIENTS.update({value: value for value in list(_NUTRIENTS.values())})
_NUTRIENTS.update(
    {
        "total_fat": "fat",
        "total_carbs": "carbohydrates",
        "carbs": "carbohydrates",
        "dietary_fiber": "fiber",
        "sugars": "sugar",
    }
)


def parse_nutrition(raw: dict | None, *, basis: str | None = None) -> dict:
    """Separate declared numbers (kcal, g, sodium/cholesterol mg) from raw text.

    No basis is inferred from recipe yield. Explicit servingSize declares a
    per-serving label; otherwise the caller must supply a declared basis.
    Unknown keys, inequalities and unparseable declarations remain raw only.
    """
    raw = raw if isinstance(raw, dict) else {}
    basis = basis if basis is not None else raw.get("nutrition_basis")
    if basis is None:
        basis = "per_serving" if raw.get("servingSize") else "unknown"
    if basis not in {"per_serving", "per_recipe", "unknown"}:
        raise ValueError("Invalid nutrition basis")
    values = {}
    for source, value in raw.items():
        key = _NUTRIENTS.get(source)
        if not key or isinstance(value, bool):
            continue
        match = re.fullmatch(
            r"\s*(\d+(?:[.,]\d+)?)\s*(kcal|cal|kj|g|mg|mcg|µg)?\s*", str(value), re.I
        )
        if not match:
            continue
        number = Fraction(match[1].replace(",", "."))
        unit = (match[2] or "").lower()
        if number > 1e9 or not math.isfinite(number):
            continue
        if key == "calories":
            if unit not in {"", "kcal", "cal", "kj"}:
                continue
            if unit == "kj":
                number /= Fraction("4.184")
        else:
            if unit not in {"", "g", "mg", "mcg", "µg"}:
                continue
            target_mg = key in {"sodium", "cholesterol"}
            if unit:
                number *= {
                    "g": Fraction(1),
                    "mg": Fraction(1, 1000),
                    "mcg": Fraction(1, 1000000),
                    "µg": Fraction(1, 1000000),
                }[unit]
                if target_mg:
                    number *= 1000
        values[key] = float(number)
    return {"nutrition": values, "nutrition_raw": copy.deepcopy(raw), "nutrition_basis": basis}


_FRACTIONS = dict(
    zip(
        "½¼¾⅓⅔⅛⅜⅝⅞⅐⅑⅒⅕⅖⅗⅘⅙⅚",
        (
            "1/2",
            "1/4",
            "3/4",
            "1/3",
            "2/3",
            "1/8",
            "3/8",
            "5/8",
            "7/8",
            "1/7",
            "1/9",
            "1/10",
            "1/5",
            "2/5",
            "3/5",
            "4/5",
            "1/6",
            "5/6",
        ),
        strict=False,
    )
)
_UNITS = {}
for _names, _unit in [
    ("teaspoon teaspoons tsp", "tsp"),
    ("tablespoon tablespoons tbsp", "Tbsp"),
    ("ounce ounces oz", "oz"),
    ("pound pounds lb lbs", "lb"),
    ("gram grams gramme grammes g", "g"),
    ("kilogram kilograms kilogramme kilogrammes kg", "kg"),
    ("millilitre millilitres milliliter milliliters ml", "ml"),
    ("centilitre centilitres centiliter centiliters cl", "cl"),
    ("decilitre decilitres deciliter deciliters dl", "dl"),
    ("litre litres liter liters l", "L"),
    ("cup cups", "cup"),
    ("pint pints pt", "pt"),
    ("quart quarts qt", "qt"),
    ("gallon gallons gal", "gal"),
]:
    _UNITS.update({name: _unit for name in _names.split()})
_UNITS.update({name: "fl oz" for name in ["fluid ounce", "fluid ounces", "fl oz", "fl. oz"]})
for _unit in "can bunch head clove slice piece sheet pinch dash handful sprig stalk".split():
    _UNITS[_unit] = _unit
    _UNITS[_unit + ("es" if _unit in {"bunch", "pinch", "dash"} else "s")] = _unit
_UNIT_RE = re.compile(
    r"^("
    + "|".join(re.escape(k) for k in sorted(_UNITS, key=len, reverse=True))
    + r")\.?(?=\s|$)\s*",
    re.I,
)
_NUMBER = r"(?:\d+\s+\d+/\d+|\d+/\d+|\d+(?:[.,]\d+)?)"
_AMOUNT_RE = re.compile(r"^(" + _NUMBER + r")(?:\s*[-–]\s*(" + _NUMBER + r"))?\s*")


def _fraction(value: str) -> str | None:
    try:
        parts = value.split()
        return str(sum((Fraction(part) for part in parts), Fraction()))
    except (ValueError, ZeroDivisionError):
        return None


def parse_ingredient(raw: str) -> dict:
    """Keep source amount text and exact rational; never convert volume to mass."""
    if not isinstance(raw, str) or len(raw) > 8192:
        raise ValueError("Invalid ingredient")
    text = raw.strip()
    result = {
        "raw": raw,
        "name": text,
        "amount": None,
        "unit": None,
        "notes": None,
        "amount_fraction": None,
    }
    if (
        text
        and not re.search(r"\d|[" + "".join(_FRACTIONS) + "]", text)
        and (
            (text.upper() == text and re.search(r"[A-Z]", text)) or re.match(r"^For\s", text, re.I)
        )
    ):
        return {**result, "name": text.rstrip(":"), "is_heading": True}
    for char, replacement in _FRACTIONS.items():
        text = re.sub(r"(\d)" + char, r"\1 " + replacement, text).replace(char, replacement)
    text = text.replace("⁄", "/")
    match = _AMOUNT_RE.match(text)
    if match:
        amount = match[1].replace(",", ".")
        result.update(amount=amount, amount_fraction=_fraction(amount))
        if match[2]:
            upper = match[2].replace(",", ".")
            result.update(
                amount=amount + "-" + upper,
                amount_fraction=None,
                amount_range=[_fraction(amount), _fraction(upper)],
            )
        text = text[match.end() :]
    unit = _UNIT_RE.match(text)
    if unit:
        result["unit"] = _UNITS[unit[1].lower()]
        text = text[unit.end() :]
    text = re.sub(r"^of\s+(?:the\s+)?", "", text, flags=re.I)
    name, comma, notes = text.partition(",")
    result.update(name=name.strip(), notes=notes.strip() if comma else None)
    return result
