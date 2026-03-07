# 🌿 EcoFi Tracker

**Scan your grocery receipt. Calculate your carbon footprint. Earn `$LEAF` tokens.**

A full-stack decentralized application (dApp) with a web frontend, Flutter mobile app, AI-powered receipt parsing, and ERC-20 token rewards on Polygon — all built for sustainable grocery shopping.

> ⚡ **Vibe-coded** — This project was built with AI-assisted development (pair-programmed with [Antigravity](https://antigravity.google)), not handwritten line-by-line. The architecture, smart contract logic, AI integration, mobile app, and UI design were collaboratively developed.

---

## 🌐 Live Demo

| Platform | URL |
|---|---|
| 📱 **Mobile App (Flutter PWA)** | [web-sage-phi-34.vercel.app](https://web-sage-phi-34.vercel.app) |
| ⛓️ **Smart Contract** | [Polygon Amoy Explorer](https://amoy.polygonscan.com/address/0xE49Dd0f38d5C1Bb803Ac4f3D6114e977B6d684fd) |
| 🔧 **Backend Oracle API** | [ecofi-tracker.onrender.com](https://ecofi-tracker.onrender.com/health) |

---

## 🎯 The Problem

Traditional carbon tracking apps rely on guilt. People download them, feel bad about their emissions, and delete them. **EcoFi flips the model** — instead of penalizing users, it pays them to optimize their choices.

## 💡 The Solution

- Scan a grocery receipt (camera, gallery, or text)
- **Gemini 2.5 Flash AI** parses items and calculates the carbon footprint using the [Poore & Nemecek (2018)](https://www.science.org/doi/10.1126/science.aaq0216) Oxford meta-analysis
- Smart contract mints **$LEAF** tokens when the basket is greener than the regional average
- Tokens can be swapped for stablecoins on Uniswap (testnet)

**We don't change what you eat — we pay you to pick greener brands of the foods you already love.**

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Flutter Mobile  │     │                 │     │                 │
│   (PWA / Web)    │────▶│  Node.js Oracle  │────▶│  Solidity ERC-20│
│                 │     │  (Render Cloud)  │     │  (Polygon Amoy) │
│  • Camera Scan  │     │                 │     │                 │
│  • CO₂ Gauge    │     │  • Gemini 2.5 AI │     │  • GreenToken   │
│  • $LEAF Banner │     │  • Carbon DB     │     │  • ECDSA verify │
│  • Wallet Sim   │     │  • ECDSA Signer  │     │  • Replay guard │
├─────────────────┤     │  • Mock fallback │     │  • Owner mint   │
│   Next.js Web   │────▶│                 │     │                 │
│   (Desktop)     │     │                 │     │                 │
│  • MetaMask     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

| Layer | Stack |
|---|---|
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin v5, Polygon Amoy Testnet |
| **Backend Oracle** | Node.js, Express, Ethers.js v6, Google Gemini 2.5 Flash AI |
| **Web Frontend** | Next.js 16, Vanilla CSS, Space Grotesk, MetaMask |
| **Mobile App** | Flutter 3.41, Dart, image_picker, Deployed as PWA on Vercel |
| **Deployment** | Render (backend), Vercel (frontend + mobile), Polygon Amoy (contract) |

---

## ✨ Features

### 🤖 AI-Powered Receipt Parsing
- **Google Gemini 2.5 Flash** extracts food items, estimates quantities, categorizes by carbon impact
- Structured JSON output with item name, category, quantity (kg), and green/eco classification
- Automatic retry with exponential backoff on rate limits
- Graceful fallback to mock data for uninterrupted demos

### 📱 Flutter Mobile App
- **Camera scanning** — take a photo of your receipt
- **Gallery upload** — pick from your photo library
- **Text input** — paste receipt items manually
- **3 hackathon presets** — 🥩 High Carbon, 🍗 Average, 🌿 Green Champion
- **Animated CO₂ gauge** with color-based scoring
- **Simulated wallet** with address, $LEAF balance tracking, and realistic transaction hashes
- **Progressive Web App (PWA)** — installable on any phone

### 🖥️ Web Frontend (Desktop)
- Dark eco-tech theme with glassmorphism and neon green accents
- MetaMask integration for real wallet connection
- On-chain $LEAF minting via ECDSA-verified backend oracle
- Same 3 demo presets + live Gemini AI text analysis

### ⛓️ Smart Contract ($LEAF Token)
- ERC-20 with ECDSA-verified minting (oracle pattern)
- Replay attack prevention via nonce tracking
- Score range validation (1–1000)
- Oracle signer rotation by owner
- Deployed on **Polygon Amoy Testnet**
- 17/17 unit tests passing

### 🌍 Carbon Scoring Engine
- 27 food categories from the Oxford meta-analysis
- Regional average comparison (14 kg CO₂e baseline)
- Eco-swap suggestions (e.g. "Swap beef for chicken → save 20.1 kg CO₂")
- $LEAF reward calculation based on green choices

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- MetaMask browser extension (optional, for desktop blockchain features)
- Flutter SDK (optional, for mobile development)

### 1. Clone & Install

```bash
git clone https://github.com/darkbite179/EcoFi-Tracker.git
cd EcoFi-Tracker

# Install all layers
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

### 3. Run (Full Stack with AI + Blockchain)

```bash
# Terminal 1: Local blockchain
cd smart-contracts && npx hardhat node

# Terminal 2: Deploy $LEAF contract
cd smart-contracts && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Oracle backend (needs GEMINI_API_KEY in .env)
cd backend && copy .env.example .env && node server.js

# Terminal 4: Frontend
cd frontend && npm run dev
```

### 4. Run Flutter Mobile App

```bash
cd mobile_app
flutter run -d chrome    # Web
flutter run -d windows   # Desktop (needs Visual Studio)
flutter build web        # Build PWA for deployment
```

### 5. Connect MetaMask (Desktop)

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
│   ├── scripts/deploy.js     # Deploy to local/Amoy testnet
│   ├── test/GreenToken.test.js
│   └── hardhat.config.js     # Local + Polygon Amoy config
│
├── backend/                  # Node.js Oracle Bridge
│   ├── server.js             # Express server (port 3001)
│   ├── routes/analyze.js     # Gemini AI parser + carbon DB + scoring
│   └── utils/signer.js       # Ethers.js ECDSA signing
│
├── frontend/                 # Next.js Web UI (Desktop)
│   ├── pages/index.js        # App state machine (scan → load → results)
│   ├── components/
│   │   ├── Navbar.jsx         # Logo + Connect Wallet (MetaMask)
│   │   ├── Scanner.jsx        # Receipt upload + 3 demo presets
│   │   ├── LoadingState.jsx   # Animated spinner with cycling text
│   │   ├── Dashboard.jsx      # Results: gauge + metrics + eco-swaps
│   │   ├── CarbonGauge.jsx    # Animated SVG arc gauge
│   │   ├── EcoSwapCard.jsx    # Per-item card with swap suggestions
│   │   └── TokenBanner.jsx    # +$LEAF reward with Claim to Wallet
│   ├── lib/constants.js       # Mock data + config
│   └── styles/globals.css     # Dark eco-tech design system
│
├── mobile_app/               # Flutter Mobile App
│   ├── lib/
│   │   ├── main.dart          # App entry + dark eco-tech theme
│   │   ├── constants.dart     # Colors, backend URL, mock data
│   │   ├── screens/
│   │   │   └── home_screen.dart  # Camera scan + wallet + results
│   │   └── widgets/
│   │       ├── carbon_gauge.dart  # Animated arc gauge
│   │       ├── token_banner.dart  # $LEAF reward banner
│   │       └── eco_swap_card.dart # Item card with swaps
│   └── build/web/             # PWA build output
│
└── render.yaml               # Render deployment config
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
ORACLE_PRIVATE_KEY=0x...        # Private key for signing mint authorizations
CONTRACT_ADDRESS=0x...           # Deployed GreenToken contract address
GEMINI_API_KEY=AIza...           # Google Gemini API key (free from aistudio.google.com)
```

### Frontend (`frontend/.env.local`) — optional
```
NEXT_PUBLIC_BACKEND_URL=https://ecofi-tracker.onrender.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xE49Dd0f38d5C1Bb803Ac4f3D6114e977B6d684fd
```

---

## 🔑 Key Design Decisions

- **Positive reinforcement only** — the app never scolds users for high-carbon choices. It just celebrates green ones.
- **Brand swaps, not food swaps** — "buy Brand B pizza instead of Brand A" rather than "eat lentils instead of steak"
- **Mock-first demo** — three hardcoded receipt presets ensure the live demo never fails, even without AI/blockchain
- **Oracle pattern** — the backend signs scores with ECDSA so users can't forge mint requests
- **Mobile wallet simulation** — realistic wallet experience on mobile without requiring WalletConnect SDK complexity
- **Gemini 2.5 Flash AI** — free, fast, no GPU needed, with automatic retry and graceful fallback

---

## 🛣️ Roadmap

- [ ] Google Cloud Vision OCR for camera-scanned receipts
- [ ] WalletConnect integration for real mobile wallet connection
- [ ] Deploy to Polygon mainnet
- [ ] Uniswap $LEAF ↔ USDC swap integration
- [ ] Barcode scanning for individual product carbon lookup
- [ ] Weekly/monthly carbon tracking dashboard
- [ ] Social sharing of green scores

---

## 📜 License

MIT
