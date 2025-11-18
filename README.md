# Victory Vault

A decentralized soccer prediction market built on Celo blockchain where users stake Celo tokens to predict match outcomes and share in the prize pool. Built with Next.js, Express, Firebase, and Solidity smart contracts.

## 📖 Overview

Victory Vault is a prediction market platform that allows users to:
- **Stake tokens** on soccer match outcomes (Team A, Team B, or Draw)
- **Earn rewards** when their predictions are correct
- **Track performance** with detailed portfolio analytics and leaderboards
- **Compete** with other users on the global rankings

The platform uses a smart contract-based system where stakes are locked until match resolution, ensuring transparency and fairness. Rewards are distributed proportionally based on the pool size and platform fees.

## 🎯 User Experience

### Key Features

1. **Match Discovery**
   - Browse active and upcoming soccer matches
   - View real-time odds based on current pool distribution
   - See match details including teams, start times, and total pool sizes

2. **Staking Interface**
   - Select your predicted outcome (Team A or Team B)
   - Enter stake amount in Celo
   - View potential winnings based on current odds
   - Confirm transaction via wallet connection

3. **Portfolio Management**
   - Track all active and resolved stakes
   - View performance metrics (ROI, win rate, total earned)
   - Monitor portfolio growth with interactive charts
   - Access detailed stake history

4. **Leaderboard**
   - Compete with other users on global rankings
   - See top performers by total earnings
   - Track your position and progress

5. **Wallet Integration**
   - Connect via AppKit (WalletConnect, MetaMask, etc.) when outside Farcaster
   - Seamless Farcaster wallet integration when inside Farcaster
   - Support for Celo network

## 💰 How to Stake

### Step-by-Step Guide

1. **Connect Your Wallet**
   - Click the "Connect Wallet" button in the header
   - Select your preferred wallet provider (MetaMask, WalletConnect, etc.)
   - Ensure you're connected to the Celo network
   - Make sure you have Celo tokens in your wallet

2. **Browse Matches**
   - Navigate to the "Markets" tab (home page)
   - Browse available active matches
   - Click on a match card to view details

3. **Select Your Prediction**
   - On the match detail page, choose either Team A or Team B
   - Review the current odds displayed
   - Odds are calculated as: `totalPool / poolForSelectedTeam`

4. **Enter Stake Amount**
   - Enter the amount of Celo you want to stake
   - The interface will show your potential winnings
   - Potential winnings = `stakeAmount × currentOdds`

5. **Confirm Transaction**
   - Review your stake details
   - Click "Place Stake" button
   - Approve the transaction in your wallet
   - Wait for blockchain confirmation

6. **Stake Recorded**
   - Your stake is now recorded on-chain
   - The match pool is updated with your stake
   - You can view your active stake in the Portfolio section

### Important Notes

- **Staking Deadline**: You can only stake before the match start time
- **Minimum Stake**: There's no minimum stake amount (subject to gas fees)
- **Pool Updates**: Odds update in real-time as more users stake
- **Active Stakes**: You can view all your active stakes in the Portfolio tab

## 🏆 How to Claim Rewards on Resolution

### When a Match is Resolved

1. **Match Resolution**
   - An oracle (admin) posts the match result
   - The smart contract marks the match as resolved
   - The winning outcome is determined (Team A, Team B, or Draw)

2. **Automatic Reward Calculation**
   - Rewards are calculated using the formula:
     ```
     reward = (yourStake / totalWinningPool) × (totalPool × (1 - platformFee))
     ```
   - Platform fee is 2% (200 basis points)
   - Only users who staked on the winning outcome are eligible

3. **Claim Your Rewards**
   - Navigate to the Portfolio section
   - Go to the "History" tab to see resolved matches
   - Find the match where you won
   - Click the "Claim" button (if available in the UI)
   - Or call the `claimReward()` function directly on the smart contract

4. **Transaction Confirmation**
   - Approve the claim transaction in your wallet
   - Wait for blockchain confirmation
   - Your Celo rewards will be transferred to your wallet

### Draw Matches

- If a match ends in a draw, all stakers can claim a refund of their original stake
- Use the `claimRefund()` function on the smart contract
- Draw payouts are handled separately from win/loss outcomes

### Important Notes

- **One-Time Claim**: Each user can only claim rewards once per match
- **Gas Fees**: You'll need to pay gas fees to claim rewards
- **Timing**: You can claim rewards anytime after the match is resolved
- **Failed Claims**: If a claim fails, you can retry the transaction

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Firebase Account** (for backend)
- **Celo Wallet** with testnet/mainnet Celo
- **Hardhat** (for smart contract deployment)

---

## 📱 Frontend Setup

The frontend is built with Next.js 15, React 19, and TypeScript.

### Key Technologies & Packages

The frontend uses a modern stack of libraries and frameworks:

#### Core Framework
- **Next.js 15** - React framework with App Router for server-side rendering and routing
- **React 19** - UI library for building interactive user interfaces
- **TypeScript** - Type-safe JavaScript for better development experience

#### Wallet & Blockchain Integration
- **Reown AppKit** (`@reown/appkit`) - Wallet connection modal and UI components for Web3 applications
  - Provides a unified wallet connection interface supporting multiple wallet providers
  - Displays a modal for users to connect via WalletConnect, MetaMask, Coinbase Wallet, and other providers
  - Only initialized when the app is loaded outside of Farcaster (uses Farcaster wallet when inside Farcaster)
  - Handles wallet connection state and provides analytics
- **Reown AppKit Wagmi Adapter** (`@reown/appkit-adapter-wagmi`) - Adapter connecting AppKit with Wagmi
- **Wagmi** (`wagmi`) - React Hooks for Ethereum (and Celo) interactions
  - Provides hooks for reading blockchain data, sending transactions, and managing wallet connections
  - Used for account management, balance queries, and contract interactions
- **Viem** (`viem`) - TypeScript Ethereum library used by Wagmi for low-level blockchain interactions
- **Farcaster MiniApp SDK** (`@farcaster/miniapp-sdk`) - SDK for Farcaster integration
- **Farcaster Wagmi Connector** (`@farcaster/miniapp-wagmi-connector`) - Connector for Farcaster wallet in Wagmi

#### UI Components & Styling
- **Radix UI** - Headless UI component library (dialogs, dropdowns, tabs, tooltips, etc.)
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Icon library
- **Recharts** - Charting library for portfolio performance visualization
- **next-themes** - Theme management for dark/light mode support

#### State Management & Data Fetching
- **TanStack Query** (`@tanstack/react-query`) - Data fetching and caching library
  - Manages server state, caching, and synchronization for API calls
- **React Hook Form** - Form state management and validation
- **Zod** - Schema validation library

#### Utilities
- **Axios** - HTTP client for API requests
- **date-fns** - Date utility library
- **clsx** & **tailwind-merge** - Utility functions for conditional class names

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Smart Contract Address (from deployment)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xYourContractAddress

# Reown AppKit / WalletConnect Project ID (get from https://cloud.reown.com)
# This is required for Reown AppKit to function properly
# AppKit uses this to establish WalletConnect connections
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Celo RPC URL (optional, defaults to public RPC)
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Divvi Consumer Identifier (optional, defaults to example address)
# Get your Divvi Consumer ID from the Divvi dashboard
# This is used for referral tracking on all staking and claiming transactions
NEXT_PUBLIC_DIVVI_CONSUMER=0xaF108Dd1aC530F1c4BdED13f43E336A9cec92B44
```

**Note on Reown AppKit**: The `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is essential for Reown AppKit to work. You can get a free project ID by:
1. Visiting [Reown Cloud](https://cloud.reown.com) (formerly WalletConnect Cloud)
2. Creating an account or signing in
3. Creating a new project
4. Copying the Project ID to your `.env.local` file

### 4. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🔧 Backend Setup

The backend is built with Express.js and uses Firebase Firestore for data storage.

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

Follow the detailed guide in `backend/FIREBASE_SETUP.md` or:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Firestore Database
4. Create a Service Account and download the JSON key
5. Extract credentials from the JSON file

### 4. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Firebase Credentials
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Server Port (optional, defaults to 4000)
PORT=4000

# CORS Origins (optional)
CORS_ORIGIN=http://localhost:3000
```

**Important**: The `FIREBASE_PRIVATE_KEY` must be wrapped in quotes and include the `\n` characters as they appear in the JSON file.

### 5. Run Development Server

```bash
npm run dev
```

The backend API will be available at `http://localhost:4000`

### 6. Run Production Server

```bash
npm start
```

### 7. Add Admin User (Optional)

```bash
npm run add-admin
```

Follow the prompts to create an admin user for the admin panel.

---

## 📜 Smart Contract Deployment

The smart contracts are written in Solidity and use Hardhat for compilation and deployment.

### 1. Navigate to Contracts Directory

```bash
cd contracts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the `contracts` directory:

```env
# Private key of the deployer wallet (without 0x prefix)
# ⚠️  SECURITY WARNING: Keep this secret! Never share or commit this value.
PRIVATE_KEY=your_wallet_private_key_here

# Celo Token Address on Celo Mainnet
# Native Celo on Celo: 0x765DE816845861e75A25fCA122bb6898B8B1282a
Celo_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a

# Address that receives platform fees
# If not set, defaults to deployer address
FEE_RECIPIENT=0x0000000000000000000000000000000000000000

# Platform fee in basis points (200 = 2%, 1000 = 10%, max 10000 = 100%)
# Default: 200 (2%)
PLATFORM_FEE_BPS=200

# Network-specific RPC URLs (optional, defaults to public RPCs)
CELO_RPC_URL=https://forno.celo.org
```

### 4. Compile Contracts

```bash
npm run build
```

### 5. Configure Celo Network

Update `hardhat.config.ts` to include Celo network configuration:

```typescript
networks: {
  hardhat: {},
  localhost: { url: "http://127.0.0.1:8545" },
  celo: {
    url: process.env.CELO_RPC_URL || "https://forno.celo.org",
    chainId: 42220,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
}
```

### 6. Deploy to Celo Mainnet

```bash
npx hardhat run scripts/deploy.ts --network celo
```

### 7. Deploy to Local Network (Testing)

In one terminal, start a local Hardhat node:

```bash
npx hardhat node
```

In another terminal, deploy to localhost:

```bash
npm run deploy
```

### 8. Save Contract Address

After deployment, the script will output the contract address. Save this address to your frontend `.env.local` file:

```env
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xYourDeployedContractAddress
```

### 9. Verify Contract (Optional)

You can verify the contract on CeloScan using Hardhat's verify plugin:

```bash
npx hardhat verify --network celo <CONTRACT_ADDRESS> <Celo_ADDRESS> <FEE_RECIPIENT> <FEE_BPS>
```

---

## 🏗️ Project Structure

```
victory-vault/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and API clients
│   └── public/       # Static assets
├── backend/          # Express.js backend API
│   ├── src/
│   │   ├── routes/   # API route handlers
│   │   ├── services/ # Business logic
│   │   └── firebase.js
│   └── server.js     # Entry point
├── contracts/        # Solidity smart contracts
│   ├── contracts/    # Contract source files
│   ├── scripts/      # Deployment scripts
│   └── test/         # Contract tests
└── admin/            # Admin panel (optional)
```

---

## 🔐 Security Notes

- **Never commit** `.env` files or private keys to version control
- **Use testnet** for development and testing
- **Verify contracts** on block explorers before mainnet deployment
- **Review smart contract code** thoroughly before deployment
- **Keep private keys secure** and use hardware wallets for production

---

## 📚 Additional Resources

- **Backend API Documentation**: See `backend/README.md`
- **Contract Documentation**: See `contracts/README.md`
- **Firebase Setup Guide**: See `backend/FIREBASE_SETUP.md`
- **Celo Documentation**: https://docs.celo.org/
- **Hardhat Documentation**: https://hardhat.org/docs

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

See LICENSE file for details.

---

## 🆘 Support

For issues, questions, or contributions, please open an issue on the repository.
