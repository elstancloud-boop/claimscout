'use strict';
// To add a source: create a file exporting {id,name,chains,scan(wallet)} and list it here.
// See docs/ADDING_ADAPTERS.md.
module.exports = [require('./lido'), require('./matic'), require('./mkr'), require('./polymarket'), require('./solana-stake')];
