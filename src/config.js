'use strict';
// Chain configuration. RPC URLs can be overridden with env vars (recommended in production:
// use a private Alchemy/Infura/QuickNode URL to avoid public-endpoint rate limits).
module.exports = {
  chains: {
    ethereum: {
      id: 1,
      name: 'Ethereum',
      rpc: process.env.RPC_ETHEREUM || 'https://ethereum-rpc.publicnode.com',
    },
  },
  solanaRpc: process.env.RPC_SOLANA || 'https://api.mainnet-beta.solana.com',
  maxWallets: 25,          // per request, protects the free RPC
  requestTimeoutMs: 20000,
};
