# Project: ClaimScout

**Goal:** a better version of hiddenfunds.xyz: more complete, safer, with alerts and guided claims.
**Owner:** you. **Status:** v0.4.0 (5 adapters: Ethereum, Polygon/Polymarket, Solana; USD; ENS).
**Created:** 2026-10-18.

## Principles
1. Accuracy over coverage: an adapter ships only when its contract address and claim URL are verified against official docs, and the source is cited in the code.
2. Read-only, no keys, no storage of addresses.
3. Small, testable steps.

## Definition of done for any adapter
- [ ] Contract address/API cited from official docs
- [ ] On-chain sanity check (e.g. symbol()) where possible
- [ ] Claim host added to allow-list with citation
- [ ] Tested against at least one real wallet with a known position
- [ ] Documented in README table and CHANGELOG

## Status board
See `docs/ROADMAP.md` for phases and checkboxes.

## Decisions log
- 2026-10-18: Plain Node + ethers, zero framework, to deploy on Render easily. Revisit Next.js at Phase 2.
- 2026-10-18: Shipped only 2 adapters whose facts were verified; others deferred until verified rather than guessed.
- 2026-10-18: MKR added after verifying token on-chain and official link. RNDR still deferred: unclear which chain/token migrated.
- 2026-10-18: Added Solana (stake) and Polymarket after verifying both against live data. Other EVM L2 withdrawals deferred: need proof libraries and cannot be verified by simple reads.
- 2026-10-18: Bugs found by live tests: Lido read-only Result crash; CoinGecko 429 (now DefiLlama first).
