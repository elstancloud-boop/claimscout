# Deploy on Render
1. Push this folder to a GitHub repo (add `.gitignore` with node_modules).
2. Render: New > Web Service > connect repo.
3. Build command `npm install`, Start command `npm start`.
4. Env vars (recommended): `RPC_ETHEREUM`, `RPC_SOLANA` = private RPC URLs.
5. Open the URL and scan a known wallet.

`render.yaml` is included (Blueprint deploy). Health check path: `/healthz`.
