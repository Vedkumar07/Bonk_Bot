import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction, 
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js';
import { config, CONSTANTS } from '../config';

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(config.SOLANA_RPC_URL, config.SOLANA_NETWORK);
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  async requestAirdrop(publicKey: PublicKey, amount: number = CONSTANTS.AIRDROP_AMOUNT): Promise<string> {
    const airdropSignature = await this.connection.requestAirdrop(
      publicKey, 
      amount * LAMPORTS_PER_SOL
    );
    await this.connection.confirmTransaction(airdropSignature);
    return airdropSignature;
  }

  async sendSol(
    from: Keypair, 
    to: PublicKey, 
    amount: number
  ): Promise<string> {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(
      this.connection, 
      transaction, 
      [from]
    );
    return signature;
  }

  async getTransactionHistory(publicKey: PublicKey, limit: number = CONSTANTS.TRANSACTION_HISTORY_LIMIT) {
    const signatures = await this.connection.getSignaturesForAddress(
      publicKey, 
      { limit }
    );

    const transactions = [];
    for (const sig of signatures) {
      const tx = await this.connection.getTransaction(sig.signature);
      if (tx && tx.meta) {
        const amount = Math.abs(tx.meta.preBalances[0] - tx.meta.postBalances[0]) / LAMPORTS_PER_SOL;
        const type = tx.meta.preBalances[0] > tx.meta.postBalances[0] ? 'Sent' : 'Received';
        transactions.push({
          signature: sig.signature,
          type,
          amount,
          slot: sig.slot,
        });
      }
    }
    return transactions;
  }

  validateAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}

export const solanaService = new SolanaService();