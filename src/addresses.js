'use strict';
const { isAddress, getAddress } = require('ethers');
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** Decodes base58 to bytes. Returns null if any character is invalid. */
function b58decode(s) {
  let n = 0n;
  for (const ch of s) { const i = ALPHABET.indexOf(ch); if (i < 0) return null; n = n * 58n + BigInt(i); }
  let hex = n.toString(16); if (hex.length % 2) hex = '0' + hex;
  const bytes = n === 0n ? [] : hex.match(/../g).map(h => parseInt(h, 16));
  const zeros = s.length - s.replace(/^1+/, '').length;
  return Uint8Array.from([...new Array(zeros).fill(0), ...bytes]);
}
function isSolanaAddress(s) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) return false;
  const b = b58decode(s); return !!b && b.length === 32;
}
function isEvmAddress(s) { return /^0x[0-9a-fA-F]{40}$/.test(s) && isAddress(s.toLowerCase()); }
/** 'evm' | 'solana' | null */
function familyOf(s) { return isEvmAddress(s) ? 'evm' : isSolanaAddress(s) ? 'solana' : null; }
function normalize(s) { return isEvmAddress(s) ? getAddress(s.toLowerCase()) : s; }

// Burn / system addresses: tokens here can never be claimed by anyone, so scanning them is misleading.
const BURN = new Set([
  '0x0000000000000000000000000000000000000000', '0x000000000000000000000000000000000000dead',
  '1nc1nerator11111111111111111111111111111111', '11111111111111111111111111111111',
]);
function isBurn(s) { return BURN.has(s.toLowerCase()) || BURN.has(s); }
module.exports = { b58decode, isSolanaAddress, isEvmAddress, familyOf, normalize, isBurn };
