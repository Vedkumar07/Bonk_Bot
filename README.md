# 🤖 Bonk Bot - Solana Wallet Manager

<div align="center">

[Try it now](https://t.me/usersolbonk_bot) 

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Usage](#usage)
- [Security](#security)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

**Bonk Bot** is a Telegram bot that provides a simple and secure way to manage Solana wallets directly from your Telegram app. No need for complex wallet apps or browser extensions - everything you need is just a message away!

**Try it now:** [@bonkbot_sol](https://t.me/usersolbonk_bot)

### Why Bonk Bot?

- 🔒 **Secure**: All private keys are encrypted using AES-256 encryption
- 🚀 **Fast**: Quick wallet generation and instant transactions
- 💬 **Conversational**: Natural chat interface for all operations
- 📱 **Mobile-Friendly**: Works seamlessly on Telegram mobile app
- 🆓 **Free**: No fees (except blockchain transaction fees)
- 🧪 **Testnet Ready**: Perfect for learning and testing with Devnet

---

## ✨ Features

### 🔑 Wallet Management
- **Generate New Wallets**: Create fresh Solana wallets instantly
- **Import Existing Wallets**: Access your previously created wallets
- **Multiple Wallets**: Manage multiple wallets per user
- **Secure Storage**: Encrypted private key storage in PostgreSQL

### 💰 Balance & Transactions
- **Check Balance**: View your SOL balance in real-time
- **Send SOL**: Transfer SOL to any Solana address
- **Transaction History**: View your recent transaction history
- **Airdrop SOL**: Request testnet SOL for development (Devnet only)

### 🔐 Security Features
- **AES-256 Encryption**: Private keys are encrypted before storage
- **Secure Key Display**: Private keys shown only when explicitly requested
- **Input Validation**: All inputs are validated before processing
- **Environment-based Configuration**: Sensitive data in environment variables

---

## 🎬 Demo

<div align="center">

### Bot Interface

```
🤖 Welcome to Solana Wallet Bot!

Your secure, easy-to-use Solana wallet manager.

Features:
• 🔑 Generate new wallets
• 📋 Import existing wallets
• 💰 Check balances
• 💸 Send SOL and SPL tokens
• 📊 View transaction history
• 🔒 Secure private key storage
```

### Sample Workflow

1. **Start the bot**: `/start`
2. **Generate wallet**: Click "🔑 Generate Wallet"
3. **Get testnet SOL**: Click "🚰 Airdrop SOL (Devnet)"
4. **Check balance**: Click "💰 Check Balance"
5. **Send SOL**: Click "💸 Send SOL" and follow prompts

</div>

---

## 🚀 Getting Started

### Prerequisites

- Bun 1.0+ (recommended runtime)
- PostgreSQL database (or Neon Database account)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Basic knowledge of TypeScript and Telegram bots

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bonk-bot.git
   cd bonk-bot
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   POSTGRES_URL=postgresql://user:password@host:5432/database
   ENCRYPTION_KEY=your_32_character_random_encryption_key
   SOLANA_RPC_URL=https://api.devnet.solana.com
   SOLANA_NETWORK=confirmed
   ```

5. **Run the bot**
   ```bash
   bun run src/index.ts
   ```

### Quick Start (Development)

```bash
bun run src/index.ts
```

Or with watch mode:
```bash
bun --watch src/index.ts
```

---

## 🏗️ Architecture

Bonk Bot follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Entry Point (index.ts)          │
│      Bot Initialization & Lifecycle     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Handler Layer (handlers/)        │
│   • Command Handlers (/start)          │
│   • Action Handlers (buttons)          │
│   • Message Handlers (text input)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Service Layer (services/)         │
│   • WalletService: CRUD operations     │
│   • SolanaService: Blockchain ops      │
└──────────────┬──────────────────────────┘
               │
         ┌─────┴─────┐
         │           │
┌────────▼──────┐ ┌──▼──────────────┐
│  Database     │ │  Solana Network │
│  (PostgreSQL) │ │  (Devnet/Mainnet)│
└───────────────┘ └─────────────────┘
```

### Key Components

- **Handlers**: Process user interactions (commands, buttons, text)
- **Services**: Business logic (wallet management, blockchain operations)
- **State Manager**: Tracks multi-step conversations
- **Utils**: Reusable helpers (encryption, keyboards, messages)

---

## 📱 Usage

### Starting the Bot

1. Open Telegram and search for [@usersolbonk_bot](https://t.me/usersolbonk_bot)
2. Click "Start" or send `/start`
3. Follow the interactive menu

### Creating a Wallet

```
1. Click "🔑 Generate Wallet"
2. Bot creates and saves your wallet
3. You receive your public key
4. Use other features like airdrop or check balance
```

### Sending SOL

```
1. Click "💸 Send SOL"
2. Enter recipient's Solana address
3. Enter amount in SOL
4. Confirm transaction
5. Receive transaction signature
```

### Importing a Wallet

```
1. Click "📋 Import Wallet"
2. Select from your previously created wallets
3. Wallet is loaded and ready to use
```

### Security Tips

⚠️ **Important Security Practices:**

- Never share your private key with anyone
- Keep your encryption key secure
- Use testnet (Devnet) for learning and testing
- Only use mainnet with small amounts for testing
- Always verify recipient addresses before sending
- Keep your bot token secret

---

## 🔐 Security

### Encryption

All private keys are encrypted using **AES-256-CBC** before being stored in the database:

```typescript
// Private keys are encrypted at rest
const encrypted = encrypt(privateKey);  // AES-256-CBC
await sql`INSERT INTO wallets (private_key) VALUES (${encrypted})`;

// Decrypted only when needed
const decrypted = decrypt(encrypted);
const keypair = Keypair.fromSecretKey(decode(decrypted));
```

### Best Practices Implemented

✅ Environment variables for sensitive data  
✅ Parameterized SQL queries (prevents SQL injection)  
✅ Input validation on all user inputs  
✅ Encrypted private key storage  
✅ No logging of sensitive information  
✅ Secure key generation using Solana's crypto library  

### Production Recommendations

For production deployment:

1. **Use stronger encryption**: Implement PBKDF2 or Argon2 for key derivation
2. **Enable rate limiting**: Prevent abuse with request throttling
3. **Add 2FA**: Implement two-factor authentication
4. **Use HSM**: Consider hardware security modules for key storage
5. **Audit logs**: Implement comprehensive logging and monitoring
6. **SSL/TLS**: Ensure all communications are encrypted
7. **Regular backups**: Backup database regularly

---

## 🛠️ Tech Stack

### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Bun** | JavaScript runtime & toolkit | 1.0+ |
| **TypeScript** | Type-safe JavaScript | 5.0+ |
| **Telegraf** | Telegram bot framework | 4.16+ |
| **Solana Web3.js** | Solana blockchain SDK | 1.95+ |
| **PostgreSQL** | Database | 14+ |
| **Neon Database** | Serverless PostgreSQL | Latest |

### Why Bun?

- ⚡ **3x faster** than Node.js
- 🚀 **Built-in TypeScript** support (no need for ts-node)
- 📦 **Fast package manager** (replaces npm/yarn)
- 🔧 **All-in-one toolkit** (bundler, test runner, package manager)
- 💾 **Lower memory usage**

### Dependencies

```json
{
  "telegraf": "^4.16.3",
  "@solana/web3.js": "^1.95.8",
  "@neondatabase/serverless": "^0.10.1",
  "bs58": "^6.0.0",
  "dotenv": "^16.4.7"
}
```

---

## 📁 Project Structure

```
bonk-bot/
├── src/
│   ├── index.ts                    # Entry point
│   ├── config/
│   │   └── index.ts               # Configuration
│   ├── database/
│   │   └── db.ts                  # Database setup
│   ├── services/
│   │   ├── walletService.ts       # Wallet management
│   │   └── solanaService.ts       # Blockchain operations
│   ├── handlers/
│   │   ├── index.ts              # Handler registration
│   │   ├── commandHandlers.ts    # Command handlers
│   │   ├── actionHandlers.ts     # Action handlers
│   │   └── messageHandlers.ts    # Message handlers
│   ├── state/
│   │   └── stateManager.ts       # State management
│   └── utils/
│       ├── encryption.ts         # Encryption utilities
│       ├── keyboards.ts          # Telegram keyboards
│       └── messages.ts           # Message templates
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Module Responsibilities

- **config/**: Centralized configuration and constants
- **database/**: Database connection and schema
- **services/**: Business logic and external integrations
- **handlers/**: User interaction logic
- **state/**: Conversation state management
- **utils/**: Reusable helper functions

---

## 💻 Development

### Setup Development Environment

```bash
# Install dependencies
bun install

# Run in development mode
bun run src/index.ts

# Run with watch mode (auto-restart on changes)
bun --watch src/index.ts

# Run tests (when implemented)
bun test

# Format code
bun run format
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "bun run src/index.ts",
    "dev": "bun --watch src/index.ts",
    "test": "bun test",
    "lint": "bunx eslint src/",
    "format": "bunx prettier --write src/"
  }
}
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Telegram Bot Configuration
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Database Configuration
POSTGRES_URL=postgresql://user:pass@host:5432/dbname

# Security
ENCRYPTION_KEY=your-super-secret-32-char-key

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=confirmed

# Optional
NODE_ENV=development
LOG_LEVEL=debug
```

### Bun-Specific Configuration

Create a `bunfig.toml` for Bun configuration (optional):

```toml
[install]
# Configure registry
registry = "https://registry.npmjs.org"

# Enable exact versions
exact = true

[install.scopes]
# Scoped packages configuration
"@solana" = { registry = "https://registry.npmjs.org" }
```

### Adding New Features

1. **Add Service Method** (if needed)
   ```typescript
   // src/services/walletService.ts
   async deleteWallet(userId: number) {
     await sql`DELETE FROM wallets WHERE user_id = ${userId}`;
   }
   ```

2. **Create Handler**
   ```typescript
   // src/handlers/actionHandlers.ts
   export async function handleDeleteWallet(ctx: Context) {
     // Implementation
   }
   ```

3. **Register Handler**
   ```typescript
   // src/handlers/index.ts
   bot.action('delete_wallet', handleDeleteWallet);
   ```

4. **Add UI Elements**
   ```typescript
   // src/utils/keyboards.ts
   Markup.button.callback('🗑️ Delete Wallet', 'delete_wallet')
   ```

---

## 🚀 Deployment

### Deploy to Production

#### Option 1: VPS (Digital Ocean, AWS EC2, etc.)

```bash
# 1. Install Bun on server
curl -fsSL https://bun.sh/install | bash

# 2. Clone repository on server
git clone https://github.com/yourusername/bonk-bot.git

# 3. Install dependencies
bun install

# 4. Use PM2 for process management
npm install -g pm2
pm2 start src/index.ts --interpreter bun --name bonk-bot

# 5. Setup auto-restart
pm2 startup
pm2 save
```

#### Option 2: Railway / Render

```bash
# 1. Create account on Railway/Render
# 2. Connect GitHub repository
# 3. Set environment variables in dashboard
# 4. Set start command: bun run src/index.ts
# 5. Deploy
```

#### Option 3: Docker

```dockerfile
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "src/index.ts"]
```

Build and run:
```bash
docker build -t bonk-bot .
docker run -d --env-file .env bonk-bot
```

#### Option 4: Fly.io

```toml
# fly.toml
app = "bonk-bot"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 8080
  protocol = "tcp"
```

Deploy:
```bash
fly launch
fly secrets set BOT_TOKEN=your_token
fly secrets set ENCRYPTION_KEY=your_key
fly deploy
```

### Production Checklist

- [ ] Set strong `ENCRYPTION_KEY` (32+ characters)
- [ ] Use production PostgreSQL database
- [ ] Enable SSL for database connection
- [ ] Set up monitoring and alerts
- [ ] Implement rate limiting
- [ ] Enable logging
- [ ] Set up automated backups
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Use mainnet RPC for production
- [ ] Implement proper error handling

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write clean, readable code
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR

---

## 📝 Roadmap

- [x] Basic wallet management
- [x] Send SOL transactions
- [x] Transaction history
- [ ] SPL Token support
- [ ] Multi-language support
- [ ] Price alerts
- [ ] NFT management
- [ ] Staking integration
- [ ] Portfolio tracking
- [ ] Advanced analytics

---

## 🐛 Known Issues

- Airdrop may fail during high network congestion
- Transaction history limited to 10 recent transactions
- No support for SPL tokens yet
- Rate limiting not implemented (use with caution)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

```
MIT License

Copyright (c) 2025 Bonk Bot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📞 Contact

**Project Maintainer**: Your Name
- Email:kmdeep567@gmail.com
- GitHub: [@Vedkumar07(https://github.com/Vedkumar07)

**Bot**: [@bonkbot_sol](https://t.me/usersolbonk_bot)


---

## 🙏 Acknowledgments

- [Solana Foundation](https://solana.com/) for the amazing blockchain
- [Telegraf](https://telegraf.js.org/) for the excellent bot framework
- [Neon Database](https://neon.tech/) for serverless PostgreSQL
- All contributors who helped improve this project

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Ved KUmar]

[Try the Bot](https://t.me/usersolbonk_bot) 

</div>
