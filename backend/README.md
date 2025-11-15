# Victory  Vault Backend

Express + Firebase (Firestore) backend implementing entities and flows from mcp/mcp.json.

## Endpoints

- GET `/health`
- Users
  - GET `/api/users/:id`
  - POST `/api/users` { walletAddress, username }
- Matches
  - GET `/api/matches`
  - GET `/api/matches/:id`
  - POST `/api/matches` { id, teamA, teamB, startTime, status, totalPool, poolA, poolB }
- Stakes
  - POST `/api/stakes` { userId, matchId, outcome, amount }
- Oracle
  - POST `/api/oracle` { matchId, source, result }
- Transactions
  - POST `/api/transactions/distribute/:matchId`

## Setup

1. Create a Firebase service account and set env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
2. Install and run:

```
cd backend
npm install
npm run dev
```

## Notes
- Tokenomics: distributes `(userStake / totalWinningPool) * (totalPool * (1 - platformFee))` with platformFee=0.02.
- All writes use Firestore transactions/batches for consistency.
