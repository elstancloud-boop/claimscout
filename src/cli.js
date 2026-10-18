#!/usr/bin/env node
'use strict';
const { parseWallets, scanWallets, expandEns } = require('./scan');
(async () => {
const ens = await expandEns(process.argv.slice(2).join(' '));
const { wallets, invalid } = parseWallets(ens.text);
invalid.push(...ens.unresolved);
if (!wallets.length) { console.error('Usage: npm run scan -- 0xAddr1 0xAddr2 ...'); process.exit(1); }
if (invalid.length) console.error('Ignored invalid:', invalid.join(', '));
scanWallets(wallets).then(r => console.log(JSON.stringify(r, null, 2))).catch(e => { console.error(e.message); process.exit(1); });
})();
