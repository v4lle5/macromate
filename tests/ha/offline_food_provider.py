"""Synthetic OFF transport for HA/browser fixtures; never opens a network socket.

The actual provider still validates requests, parses JSON and applies its cache
and quota. Empty search results and missing barcodes are controlled fixture data,
not evidence about the public Open Food Facts service.
"""

from __future__ import annotations


class _Response:
    def __init__(self, status, body):
        self.status = status
        self.headers = {"Content-Type": "application/json", "Content-Length": str(len(body))}
        self.content = self
        self._body = body

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_):
        return False

    async def iter_chunked(self, _size):
        yield self._body


class OfflineFoodFactsTransport:
    def __init__(self):
        self.calls = []

    def get(self, url, *, params, headers, allow_redirects, timeout):
        assert allow_redirects is False
        assert headers["Accept"] == "application/json"
        assert timeout.total is not None
        if url == "https://world.openfoodfacts.org/cgi/search.pl":
            response = _Response(200, b'{"products":[],"count":0}')
        elif url.startswith("https://world.openfoodfacts.org/api/v3.6/product/"):
            response = _Response(404, b'{}')
        else:
            raise AssertionError("Unexpected synthetic food-provider route")
        self.calls.append({"url": url, "params": dict(params)})
        return response


def install_offline_food_provider(hass, provider_class=None):
    """Share one actual provider across coordinator reloads and named profiles."""
    if provider_class is None:
        from custom_components.macromate.food_provider import OpenFoodFactsProvider

        provider_class = OpenFoodFactsProvider
    transport = OfflineFoodFactsTransport()
    hass.data.setdefault("macromate_provider", {})["provider"] = provider_class(
        transport, enabled=True
    )
    return transport
