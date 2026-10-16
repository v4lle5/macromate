#!/usr/bin/env python3
"""Scoped MacroMate client; credentials in owner-only files, never CLI literals.

No retries, redirects, environment proxies, generic HA/service path or token
printing. Mint is an operator-only step; the agent needs only the output file.
Action discovery and the exact read/update scope matrix are documented in
SCOPED_AGENT_ACCESS.md. Update never implies read: full-record update responses,
including no-ops and retained replays, require their related read scopes. A 403
is a boundary refusal, not a reason to retry via native HA or a different ID.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import stat
import sys
from http.client import HTTPException
from urllib.error import HTTPError, URLError
from urllib.request import Request, ProxyHandler, build_opener

try:
    from .macromate_client import service_url, _NoRedirects, _validate_json_data, _unique_object, _reject_constant, _finite_float
except ImportError:
    from macromate_client import service_url, _NoRedirects, _validate_json_data, _unique_object, _reject_constant, _finite_float

MAX_BODY = 256 * 1024
MAX_RESPONSE = 4 * 1024 * 1024


def read_secret(path):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077 or not 1 <= info.st_size <= 4096:
            raise ValueError('Secret file must be owner-only, regular, bounded and owned by current user')
        with os.fdopen(fd, 'r', encoding='ascii', closefd=False) as stream:
            token = stream.read(4097)
        if not re.fullmatch(r'[\x21-\x7e]+\n?', token):
            raise ValueError('Invalid secret file')
        return token.rstrip('\n')
    finally:
        os.close(fd)


def _request(origin, token, path, payload=None, *, method='POST', trusted_lan_http=False):
    # Reuse the existing strict credential-free-origin validator, not its broad
    # service transport. Only internally fixed scoped paths reach this helper.
    service_url(origin, 'describe', response=False, trusted_lan_http=trusted_lan_http)
    if not isinstance(token, str) or not re.fullmatch(r'[\x21-\x7e]{1,4096}', token):
        raise ValueError('Invalid credential')
    if payload is not None:
        if not isinstance(payload, dict):
            raise ValueError('JSON object required')
        _validate_json_data(payload)
        encoded = json.dumps(payload, allow_nan=False, ensure_ascii=False).encode()
        if len(encoded) > MAX_BODY:
            raise ValueError('Request too large')
    else:
        encoded = None
    request = Request(origin.rstrip('/') + path, data=encoded, method=method,
                      headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
    try:
        with build_opener(ProxyHandler({}), _NoRedirects()).open(request, timeout=20) as response:
            raw = response.read(MAX_RESPONSE + 1)
            if len(raw) > MAX_RESPONSE:
                raise ValueError('Response too large')
            length = response.headers.get('Content-Length')
            if length is not None and int(length) != len(raw):
                raise ValueError('Response truncated')
            result = json.loads(raw, object_pairs_hook=_unique_object, parse_constant=_reject_constant, parse_float=_finite_float)
            _validate_json_data(result)
            json.dumps(result, allow_nan=False, ensure_ascii=False).encode()
            if not isinstance(result, dict):
                raise ValueError('Response object required')
            return result
    except HTTPError as error:
        code = error.code
        error.close()
        raise RuntimeError(f'MacroMate returned HTTP {code}; no retry performed') from None
    except (URLError, OSError, HTTPException, ValueError, UnicodeError, RecursionError):
        raise RuntimeError('MacroMate transport/response failure; outcome uncertain; retain request_id') from None


def call_action(origin, token, action, payload, *, trusted_lan_http=False):
    if not isinstance(action, str) or not re.fullmatch(r'[a-z][a-z0-9_]{0,63}', action):
        raise ValueError('Invalid action')
    if not re.fullmatch(r'mm1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}', token):
        raise ValueError('Scoped MacroMate credential required, not a HA token')
    return _request(origin, token, '/api/macromate/agent/action/' + action, payload, trusted_lan_http=trusted_lan_http)


def mint_to_file(origin, admin_file, output_file, payload, *, trusted_lan_http=False):
    """Create exactly one 0600 file; return metadata only. Never overwrite."""
    admin_token = read_secret(admin_file)
    fd = os.open(output_file, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    try:
        result = _request(origin, admin_token, '/api/macromate/agent/credentials', payload, trusted_lan_http=trusted_lan_http)
        token = result.pop('token', None)
        if not isinstance(token, str) or not re.fullmatch(r'mm1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}', token):
            raise RuntimeError('Invalid mint response; inspect credential metadata before retry')
        with os.fdopen(fd, 'w', closefd=False) as stream:
            stream.write(token + '\n')
            stream.flush()
            os.fsync(fd)
        return result
    finally:
        os.close(fd)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--origin', required=True)
    parser.add_argument('--secret-file', required=True)
    parser.add_argument('--trusted-lan-http', action='store_true')
    sub = parser.add_subparsers(dest='command', required=True)
    call = sub.add_parser('call')
    call.add_argument('action')
    call.add_argument('--json-file', required=True)
    mint = sub.add_parser('mint')
    mint.add_argument('--output-file', required=True)
    mint.add_argument('--label', required=True)
    mint.add_argument('--scope', action='append')
    mint.add_argument('--expires-at', type=int)
    sub.add_parser('list')
    revoke = sub.add_parser('revoke')
    revoke.add_argument('credential_id')
    args = parser.parse_args(argv)
    try:
        if args.command == 'mint':
            payload = {'label': args.label}
            if args.scope is not None:
                payload['scopes'] = args.scope
            if args.expires_at is not None:
                payload['expires_at'] = args.expires_at
            result = mint_to_file(args.origin, args.secret_file, args.output_file, payload, trusted_lan_http=args.trusted_lan_http)
        elif args.command == 'call':
            raw = Path(args.json_file).read_bytes()
            if len(raw) > MAX_BODY:
                raise ValueError('Request too large')
            payload = json.loads(raw, object_pairs_hook=_unique_object, parse_constant=_reject_constant, parse_float=_finite_float)
            result = call_action(args.origin, read_secret(args.secret_file), args.action, payload, trusted_lan_http=args.trusted_lan_http)
        else:
            path = '/api/macromate/agent/credentials'
            if args.command == 'revoke':
                if not re.fullmatch('[0-9a-f]{32}', args.credential_id):
                    raise ValueError('Invalid credential id')
                path += '/' + args.credential_id
            result = _request(args.origin, read_secret(args.secret_file), path, method='DELETE' if args.command == 'revoke' else 'GET', trusted_lan_http=args.trusted_lan_http)
        print(json.dumps(result, allow_nan=False))
        return 0
    except (ValueError, OSError, RuntimeError, RecursionError):
        print('Scoped request failed; no retry performed. Inspect metadata/readback before retrying writes.', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
