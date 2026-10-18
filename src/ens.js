'use strict';
const { getProvider } = require('./rpc');
/** Resolve "name.eth" to an address via Ethereum mainnet. Returns null if unresolved. */
async function resolveEns(name) {
  try { return await getProvider('ethereum').resolveName(name); } catch { return null; }
}
module.exports = { resolveEns };
