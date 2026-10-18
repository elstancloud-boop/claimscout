'use strict';
const { Contract, formatUnits, getAddress } = require('ethers');
const { getProvider } = require('../rpc');

// MATIC (Ethereum) -> POL upgrade, 1:1. Token address is verified at runtime via symbol().
// Source: https://docs.polygon.technology/pos/concepts/tokens/matic-to-pol
const MATIC = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0';
const ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

module.exports = {
  id: 'matic-to-pol',
  name: 'Old MATIC never upgraded to POL',
  family: 'evm',
  chains: ['ethereum'],
  async scan(wallet) {
    const c = new Contract(MATIC, ABI, getProvider('ethereum'));
    const bal = await c.balanceOf(wallet);
    if (bal === 0n) return [];
    const [symbol, decimals] = await Promise.all([c.symbol(), c.decimals()]);
    if (symbol !== 'MATIC') throw new Error(`Unexpected token symbol ${symbol} at ${MATIC}`);
    return [{
      adapter: 'matic-to-pol',
      protocol: 'Polygon',
      category: 'Token upgrades',
      chain: 'Ethereum',
      wallet: getAddress(wallet),
      title: 'MATIC on Ethereum can be upgraded to POL',
      amount: formatUnits(bal, decimals),
      symbol: 'MATIC',
      status: 'claimable',
      claimUrl: 'https://portal.polygon.technology/pol-upgrade',
      steps: [
        'Open the official Polygon Portal upgrade page.',
        'Switch your wallet to the Ethereum network and connect.',
        'Approve, then confirm the 1:1 upgrade to POL.',
      ],
      source: 'https://docs.polygon.technology/pos/concepts/tokens/matic-to-pol',
    }];
  },
};
