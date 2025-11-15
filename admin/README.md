# Victory  Vault Admin

Admin dashboard for managing the Victory  Vault prediction market backend.

## Features

- **Dashboard**: Overview of matches, users, and statistics
- **Matches Management**: Create, view, and manage matches
- **Users**: View user statistics and wallet addresses
- **Oracle**: Post match results from oracle feeds
- **Rewards**: Distribute rewards for resolved matches

## Setup

1. Install dependencies:
```bash
cd admin
npm install
```

2. Configure environment:
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. Run development server:
```bash
npm run dev
```

The admin dashboard will be available at http://localhost:3001

## Pages

- `/` - Dashboard with statistics
- `/matches` - List all matches
- `/matches/new` - Create a new match
- `/users` - View all users
- `/oracle` - Post oracle results

