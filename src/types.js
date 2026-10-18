'use strict';
/**
 * Finding = one claimable (or possibly claimable) position.
 * @typedef {Object} Finding
 * @property {string} adapter      adapter id, e.g. "lido-withdrawals"
 * @property {string} protocol     human name, e.g. "Lido"
 * @property {string} category     e.g. "Staking", "Token upgrades"
 * @property {string} chain        chain name
 * @property {string} wallet       checksummed address that owns the position
 * @property {string} title        short headline
 * @property {string} amount       decimal string, e.g. "3.10"
 * @property {string} symbol       asset symbol
 * @property {'claimable'|'needs-team'|'uncertain'} status
 * @property {string} claimUrl     OFFICIAL page to claim (must be https and on an allow-listed host)
 * @property {string[]} steps      plain-language steps
 * @property {string} source       URL of documentation this adapter's logic is based on
 */
module.exports = {};
