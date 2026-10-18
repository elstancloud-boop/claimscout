'use strict';
const { Contract, formatEther, getAddress } = require('ethers');
const { getProvider } = require('../rpc');

// Source: https://docs.lido.fi/deployed-contracts/  and  https://docs.lido.fi/contracts/withdrawal-queue-erc721
const QUEUE = '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1';
const ABI = [
  'function getWithdrawalRequests(address _owner) view returns (uint256[] requestsIds)',
  'function getWithdrawalStatus(uint256[] _requestIds) view returns (tuple(uint256 amountOfStETH, uint256 amountOfShares, address owner, uint256 timestamp, bool isFinalized, bool isClaimed)[] statuses)',
];

module.exports = {
  id: 'lido-withdrawals',
  name: 'Lido withdrawals never claimed',
  family: 'evm',
  chains: ['ethereum'],
  /** @param {string} wallet */
  async scan(wallet) {
    const c = new Contract(QUEUE, ABI, getProvider('ethereum'));
    // ethers returns a read-only Result; copy to a plain array before reusing it as an argument.
    const ids = [...(await c.getWithdrawalRequests(wallet))];
    if (ids.length === 0) return [];
    const statuses = await c.getWithdrawalStatus(ids);
    const out = [];
    statuses.forEach((s, i) => {
      if (s.isFinalized && !s.isClaimed) {
        out.push({
          adapter: 'lido-withdrawals',
          protocol: 'Lido',
          category: 'Staking',
          chain: 'Ethereum',
          wallet: getAddress(wallet),
          title: `Withdrawal request #${ids[i]} is ready but not claimed`,
          amount: formatEther(s.amountOfStETH),
          symbol: 'ETH',
          status: 'claimable',
          claimUrl: 'https://stake.lido.fi/withdrawals/claim',
          steps: [
            'Open the official Lido withdrawals page.',
            'Connect the same wallet that made the request.',
            'Press Claim and confirm the transaction (you pay a small gas fee).',
          ],
          source: 'https://docs.lido.fi/contracts/withdrawal-queue-erc721',
        });
      }
    });
    return out;
  },
};
