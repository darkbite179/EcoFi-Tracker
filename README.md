# 🌿 EcoFi Tracker

**Scan your grocery receipt. Calculate your carbon footprint. Earn `$LEAF` tokens.**

A decentralized application (dApp) that turns sustainable grocery shopping into a tokenized micro-economy. Choose greener brands → earn ERC-20 rewards → swap for stablecoins.

> ⚡ **Vibe-coded** — This project was built with AI-assisted development (pair-programmed with [Antigravity](https://antigravity.google)), not handwritten line-by-line. The architecture, smart contract logic, and UI design were collaboratively developed in a single session.

---

## 🎯 The Problem

Traditional carbon tracking apps rely on guilt. People download them, feel bad about their emissions, and delete them. **EcoFi flips the model** — instead of penalizing users, it pays them to optimize their choices.

## 💡 The Solution

- Scan a grocery receipt (or pick a demo preset)
- AI parses items and calculates the carbon footprint using the [Poore & Nemecek (2018)](https://www.science.org/doi/10.1126/science.aaq0216) Oxford meta-analysis
- Smart contract mints **$LEAF** tokens when the basket is greener than the regional average
- Tokens can be swapped for stablecoins on Uniswap (testnet)

**We don't change what you eat — we pay you to pick greener brands of the foods you already love.**

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js UI    │────▶│  Node.js Oracle  │────▶│  Solidity ERC-20│
│   (Port 3000)   │     │  (Port 3001)     │     │  (Hardhat 8545) │
│                 │     │                 │     │                 │
│  • Scanner      │     │  • Ollama LLM    │     │  • GreenToken   │
│  • CO₂ Gauge    │     │  • Carbon DB     │     │  • ECDSA verify │
│  • $LEAF Banner │     │  • ECDSA Signer  │     │  • Replay guard │
│  • MetaMask     │     │  • Mock fallback │     │  • Owner mint   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

| Layer | Stack |
|---|---|
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin v5 |
| **Backend Oracle** | Node.js, Express, Ethers.js v6, Ollama |
| **Frontend** | Next.js 16, Tailwind CSS, Space Grotesk |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- MetaMask browser extension (optional, for blockchain features)

### 1. Clone & Install

```bash
git clone https://github.com/darkbite179/EcoFi-Tracker.git
cd EcoFi-Tracker

# Install all three layers
cd smart-contracts && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Run (Demo Mode — no blockchain needed)

```bash
# Start frontend only
cd frontend && npm run dev
```

Open `http://localhost:3000` — the three preset buttons work instantly with mock data.

### 3. Run (Full Stack with Blockchain)

```bash
# Terminal 1: Local blockchain
cd smart-contracts && npx hardhat node

# Terminal 2: Deploy $LEAF contract
cd smart-contracts && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Oracle backend
cd backend && copy .env.example .env && node server.js

# Terminal 4: Frontend
cd frontend && npm run dev
```

### 4. Connect MetaMask

1. Open MetaMask → Add Network → **Hardhat Local** (RPC: `http://127.0.0.1:8545`, Chain ID: `31337`)
2. Import Account #0 private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. Click **Connect Wallet** in the app

---

## 🧪 Smart Contract Tests

```bash
cd smart-contracts && npx hardhat test
```

```
GreenToken ($LEAF)
  Deployment
    ✓ should set the correct token name and symbol
    ✓ should set the deployer as the owner
    ✓ should set the correct oracle signer
    ✓ should revert if oracle signer is zero address
  mintReward()
    ✓ should mint the correct amount of tokens for a valid signature
    ✓ should mark the nonce as used after minting
    ✓ should reject a replay attack (same nonce used twice)
    ✓ should reject a signature made by a wallet that is NOT the oracle
    ✓ should reject a signature for a different user address
    ✓ should reject a score of zero
    ✓ should reject a score exceeding MAX_SCORE_PER_CLAIM
  updateOracleSigner()
    ✓ should allow the owner to rotate the oracle signer
    ✓ should reject a non-owner caller
    ✓ should reject zero address
    ✓ should allow minting with the NEW signer after rotation
  ownerMint()
    ✓ should allow owner to mint tokens directly
    ✓ should reject non-owner callers

17 passing (826ms)
```

---

## 📁 Project Structure

```
EcoFi-Tracker/
├── smart-contracts/          # Solidity + Hardhat
│   ├── contracts/
│   │   └── GreenToken.sol    # ERC-20 $LEAF with ECDSA-verified minting
│   ├── scripts/deploy.js     # Deploy + seed demo balance
│   ├── test/GreenToken.test.js
│   └── hardhat.config.js     # Local + Polygon Amoy testnet
│
├── backend/                  # Node.js Oracle Bridge
│   ├── server.js             # Express server (port 3001)
│   ├── routes/analyze.js     # Ollama LLM parser + carbon DB + scoring
│   └── utils/signer.js       # Ethers.js ECDSA signing
│
└── frontend/                 # Next.js UI
    ├── pages/index.js        # App state machine (scan → load → results)
    ├── components/
    │   ├── Navbar.jsx         # Logo + Connect Wallet
    │   ├── Scanner.jsx        # Receipt upload + 3 demo presets
    │   ├── LoadingState.jsx   # Animated spinner with cycling text
    │   ├── Dashboard.jsx      # Results: gauge + metrics + eco-swaps
    │   ├── CarbonGauge.jsx    # Animated SVG arc gauge
    │   ├── EcoSwapCard.jsx    # Per-item card with swap suggestions
    │   └── TokenBanner.jsx    # +$LEAF reward with Claim to Wallet
    ├── lib/constants.js       # Mock data + config
    └── styles/globals.css     # Dark eco-tech design system
```

---

## 🔑 Key Design Decisions

- **Positive reinforcement only** — the app never scolds users for high-carbon choices. It just celebrates green ones.
- **Brand swaps, not food swaps** — "buy Brand B pizza instead of Brand A" rather than "eat lentils instead of steak"
- **Mock-first demo** — three hardcoded receipt presets ensure the live demo never fails, even without Ollama/blockchain
- **Oracle pattern** — the backend signs scores with ECDSA so users can't forge mint requests

---

## 📜 License

MIT
