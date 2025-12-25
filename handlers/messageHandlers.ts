import { Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { PublicKey } from '@solana/web3.js';
import { walletService } from '../services/walletService';
import { solanaService } from '../services/solanaService';
import { stateManager } from '../state/stateManager';
import { keyboards } from '../utils/keyboards';
import { messages } from '../utils/messages';

export async function handleTextMessage(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (!('text' in ctx.message)) return;
  const text = ctx.message.text;

  const pendingRequest = stateManager.getPendingRequest(userId);

  if (!pendingRequest) {
    return;
  }

  // Handle recipient address input
  if (pendingRequest.type === 'SEND_SOL' && !pendingRequest.to) {
    if (!solanaService.validateAddress(text)) {
      await ctx.reply(messages.errors.invalidAddress, {
        parse_mode: 'Markdown',
        ...keyboards.walletActions
      });
      stateManager.clearPendingRequest(userId);
      return;
    }

    stateManager.updatePendingRequest(userId, { to: text });
    await ctx.reply(messages.prompts.enterAmount);
    return;
  }

  // Handle amount input
  if (pendingRequest.type === 'SEND_SOL' && pendingRequest.to) {
    await handleSendSolTransaction(ctx, userId, text, pendingRequest.to);
  }
}

async function handleSendSolTransaction(
  ctx: Context, 
  userId: number, 
  amountText: string, 
  toAddress: string
) {
  const amount = parseFloat(amountText);

  if (isNaN(amount) || amount <= 0) {
    await ctx.reply(messages.errors.invalidAmount, {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    });
    stateManager.clearPendingRequest(userId);
    return;
  }

  const keypair = walletService.getActiveWallet(userId);

  if (!keypair) {
    await ctx.reply(messages.errors.noWallet, {
      parse_mode: 'Markdown',
      ...keyboards.onlyGenerate
    });
    stateManager.clearPendingRequest(userId);
    return;
  }

  try {
    const toPublicKey = new PublicKey(toAddress);
    const balance = await solanaService.getBalance(keypair.publicKey);

    if (balance < amount) {
      await ctx.reply(messages.insufficientBalance(balance), {
        parse_mode: 'Markdown',
        ...keyboards.walletActions
      });
      stateManager.clearPendingRequest(userId);
      return;
    }

    await ctx.reply(messages.transactionInitializing(amount, toAddress));

    const signature = await solanaService.sendSol(keypair, toPublicKey, amount);

    await ctx.reply(messages.transactionSuccess(signature), {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    await ctx.reply(messages.errors.transactionFailed, {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    });
  } finally {
    stateManager.clearPendingRequest(userId);
  }
}