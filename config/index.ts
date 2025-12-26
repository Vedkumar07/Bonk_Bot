import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

console.log('🔍 Loaded env vars:', {
  BOT_TOKEN: process.env.BOT_TOKEN ? '✅' : '❌',
  POSTGRES_URL: process.env.POSTGRES_URL ? '✅' : '❌',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? '✅' : '❌',
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL ? '✅' : '❌',
  SOLANA_NETWORK: process.env.SOLANA_NETWORK ? '✅' : '❌',
});

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || "8561665479:AAEFQrgO-6y-gB5sr2IGdYLYuFLwADxu7eQ",
  POSTGRES_URL: process.env.POSTGRES_URL!,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'default-key-change-in-prod',
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  SOLANA_NETWORK: (process.env.SOLANA_NETWORK || 'confirmed') as 'confirmed' | 'finalized',
} as const;

export const CONSTANTS = {
  TRANSACTION_HISTORY_LIMIT: 10,
  AIRDROP_AMOUNT: 1, // SOL
} as const;