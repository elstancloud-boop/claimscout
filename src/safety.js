'use strict';
// Every claim link a user sees must be on this allow-list of OFFICIAL hosts.
// Adding a host requires a pull request that cites where the project publishes that URL.
module.exports = {
  ALLOWED_HOSTS: [
    'stake.lido.fi',                // https://docs.lido.fi
    'app.sky.money',                // https://upgrademkrtosky.skyeco.com/ ("Visit app.sky.money to upgrade")
    'solana.com',                   // https://solana.com/staking (withdraw once Inactive)
    'polymarket.com',               // https://polymarket.com/portfolio (official portfolio page)
    'portal.polygon.technology',    // https://docs.polygon.technology/pos/concepts/tokens/matic-to-pol
  ],
};
