'use strict';
const { Contract, formatUnits, getAddress, decodeBytes32String } = require('ethers');
const { getProvider } = require('../rpc');

// MKR (Ethereum) -> SKY upgrade, fixed 1 MKR : 24,000 SKY, minus the Delayed Upgrade Penalty (grows over time).
// Sources: https://upgrademkrtosky.skyeco.com/  https://developers.skyeco.com/guides/sky/token-governance-upgrade/token-holders/
// MKR uses bytes32 symbol(); verified on-chain: symbol "MKR", name "Maker", 18 decimals.
const MKR = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
const ABI = ['function balanceOf(address) view returns (uint256)', 'function symbol() view returns (bytes32)'];

module.exports = {
  id: 'mkr-to-sky',
  name: 'Old MKR never upgraded to SKY',
  family: 'evm',
  chains: ['ethereum'],
  async scan(wallet) {
    const c = new Contract(MKR, ABI, getProvider('ethereum'));
    const bal = await c.balanceOf(wallet);
    if (bal === 0n) return [];
    const symbol = decodeBytes32String(await c.symbol());
    if (symbol !== 'MKR') throw new Error(`Unexpected token symbol ${symbol} at ${MKR}`);
    return [{
      adapter: 'mkr-to-sky',
      protocol: 'Sky (Maker)',
      category: 'Token upgrades',
      chain: 'Ethereum',
      wallet: getAddress(wallet),
      title: 'MKR can be upgraded to SKY (no deadline, but a delay penalty grows every 3 months)',
      amount: formatUnits(bal, 18),
      symbol: 'MKR',
      status: 'claimable',
      claimUrl: 'https://app.sky.money/',
      steps: [
        'Open the official Sky.money app and choose the Upgrade option.',
        'Connect the wallet that holds the MKR.',
        'Review the SKY amount shown (it includes the current delay penalty), then confirm.',
        'The upgrade cannot be reversed inside the Sky protocol.',
      ],
      source: 'https://upgrademkrtosky.skyeco.com/',
    }];
  },
};
