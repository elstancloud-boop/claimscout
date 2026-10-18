# Security
- Read-only RPC calls. No signer, no wallet connect, no signatures.
- Addresses are not logged or stored. Hosting provider logs may still see requests; do not add logging of bodies.
- Claim links only from `ALLOWED_HOSTS`; scan.js throws otherwise.
- UI uses textContent; CSP blocks inline scripts and external loads; path traversal blocked (tested: `..%2f` returns 404).
- Rate limit 10/min/IP, body limit 20KB. Behind a proxy, `x-forwarded-for` is trusted (Render sets it); do not expose directly to the internet without a proxy.
- Anti-scam copy must stay on the page. If scammers clone the site, publish the canonical domain here.
## Reporting
Add a security contact before public launch.
