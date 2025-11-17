# Victory  Vault Contracts

Hardhat project for the soccer prediction market.

## Contracts
- `VictoryVault.sol` — CELO staking, createMatch, stake, resolveMatch, claimReward, platform fee.

## Quickstart

1. Copy the example env file and fill in your values:
```bash
cp env.example .env
# Edit .env with your private key, and fee recipient
```

2. Install dependencies and compile:
```bash
npm install
npm run build
```

3. Deploy to Celo mainnet:
```bash
npx hardhat run scripts/deploy.ts --network celo
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
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x5f98baDb7b5d3aFA246a3A637Ccb0529E6362287
~/victoryvault/contracts>


