# Victory  Vault Contracts

Hardhat project for the soccer prediction market.

## Contracts
- `PredictionMarket.sol` — USDC staking, createMatch, stake, resolveMatch, claimReward, platform fee.

## Quickstart

1. Copy the example env file and fill in your values:
```bash
cp env.example .env
# Edit .env with your private key, USDC address, and fee recipient
```

2. Install dependencies and compile:
```bash
npm install
npm run build
```

3. Deploy to Base mainnet:
```bash
npx hardhat run scripts/deploy.ts --network base
```

For local testing:
```bash
npx hardhat node
# in another terminal
npm run deploy
```

## Notes
- Rewards follow: `(userStake / totalWinningPool) * (totalPool * (1 - platformFee))`.
- Draw payouts not implemented (as per scope).
- For production, set a real USDC address and fee recipient.



Save this address for your frontend .env:
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xd8d5EC59A5e28Df6e9c1A5DAf5dC82F38Aea6442
~/beyond-banter/contracts>


