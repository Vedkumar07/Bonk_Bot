import { Keypair, PublicKey } from '@solana/web3.js';
import { encode, decode } from 'bs58';
import { sql } from '../database/db';
import { encrypt, decrypt } from '../utils/encryption';

export class WalletService {
  private userWallets: Record<string, Keypair> = {};

  generateWallet(): Keypair {
    return Keypair.generate();
  }

  async saveWallet(userId: number, keypair: Keypair): Promise<void> {
    const privateKeyEncoded = encode(keypair.secretKey);
    const encryptedPrivateKey = encrypt(privateKeyEncoded);

    await sql`
      INSERT INTO wallets (user_id, public_key, private_key) 
      VALUES (${userId}, ${keypair.publicKey.toBase58()}, ${encryptedPrivateKey})
    `;

    this.userWallets[userId] = keypair;
    console.log(`✅ Wallet saved for user ${userId}`);
  }

  async loadWallet(userId: number, publicKey: string): Promise<Keypair | null> {
    const wallet = await sql`
      SELECT private_key 
      FROM wallets 
      WHERE user_id = ${userId} AND public_key = ${publicKey}
    `;

    if (wallet.length === 0) {
      return null;
    }

    try {
      let secretKey: Uint8Array;
      try {
        secretKey = decode(wallet[0].private_key);
      } catch {
        const decryptedPrivateKey = decrypt(wallet[0].private_key);
        secretKey = decode(decryptedPrivateKey);
      }

      const keypair = Keypair.fromSecretKey(secretKey);
      this.userWallets[userId] = keypair;
      return keypair;
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return null;
    }
  }

  async getUserWallets(userId: number): Promise<Array<{ public_key: string }>> {
    return await sql`
      SELECT public_key 
      FROM wallets 
      WHERE user_id = ${userId}
    `;
  }

  getActiveWallet(userId: number): Keypair | undefined {
    return this.userWallets[userId];
  }

  getPrivateKey(userId: number): string | null {
    const keypair = this.userWallets[userId];
    if (!keypair) return null;
    return encode(keypair.secretKey);
  }
}

export const walletService = new WalletService();