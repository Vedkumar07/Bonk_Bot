export const messages = {
  welcome: `
🤖 **Welcome to Solana Wallet Bot!**

Your secure, easy-to-use Solana wallet manager.

**Features:**
- 🔑 Generate new wallets
- 📋 Import existing wallets
- 💰 Check balances
- 💸 Send SOL and SPL tokens
- 📊 View transaction history
- 🔒 Secure private key storage

**Security:**
- All private keys are encrypted
- Never share your private keys
- Use at your own risk (testnet recommended)

Choose an option below to get started:`,

  walletCreated: (publicKey: string) => 
    `✅ Wallet Created for you with public key ${publicKey}`,

  walletImported: (publicKey: string) => 
    `✅ Wallet imported successfully! Public key: ${publicKey}`,

  publicKey: (publicKey: string) => 
    `✅ This is your public key ${publicKey}`,

  privateKey: (privateKey: string) => 
    `⚠️ **WARNING: Never share your private key!**

🔑 **Private Key:** \`${privateKey}\`

This key gives full access to your wallet. Keep it secure and never share it with anyone.`,

  balance: (balance: number) => 
    `💰 Your balance: ${balance} SOL`,

  airdropSuccess: (amount: number) => 
    `✅ Airdrop successful! ${amount} SOL added to your wallet.`,

  transactionSuccess: (signature: string) => 
    `✅ Transaction successful! Signature: ${signature}`,

  transactionInitializing: (amount: number, address: string) => 
    `🔄 Initializing transaction to send ${amount} SOL to ${address}...`,

  insufficientBalance: (balance: number) => 
    `❌ Insufficient balance. You have ${balance} SOL.`,

  errors: {
    noWallet: "❌ No wallet found. Please generate a wallet first.",
    noPreviousWallets: "❌ No previous wallets found. Please generate a new wallet first.",
    walletNotFound: "❌ Wallet not found.",
    importFailed: "❌ Failed to import wallet.",
    invalidAmount: "❌ Invalid amount. Please enter a positive number.",
    invalidAddress: "❌ Invalid recipient address.",
    transactionFailed: "❌ Transaction failed. Please try again.",
    balanceCheckFailed: "❌ Failed to check balance. Please try again.",
    historyFetchFailed: "❌ Failed to fetch transaction history. Please try again.",
    airdropFailed: "❌ Airdrop failed. Please try again later.",
    airdropLimit: "❌ Airdrop failed: You've reached your daily airdrop limit or the faucet is dry. Visit https://faucet.solana.com for more test SOL.",
    noTransactions: "📊 No transactions found for this wallet.",
  },

  prompts: {
    enterAddress: "Can you share the address to send SOL to",
    enterAmount: "How much SOL do you want to send ",
    selectWallet: "Select a wallet to import:",
  }
};