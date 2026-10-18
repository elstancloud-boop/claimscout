'use strict';
const { JsonRpcProvider } = require('ethers');
const config = require('./config');

const cache = new Map();
/** Returns a cached read-only provider for a chain key from config.chains. */
function getProvider(chainKey) {
  const chain = config.chains[chainKey];
  if (!chain) throw new Error(`Unknown chain: ${chainKey}`);
  if (!cache.has(chainKey)) {
    cache.set(chainKey, new JsonRpcProvider(chain.rpc, chain.id, { staticNetwork: true }));
  }
  return cache.get(chainKey);
}
module.exports = { getProvider };
