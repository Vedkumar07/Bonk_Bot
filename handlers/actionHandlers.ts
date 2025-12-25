import { Context } from 'telegraf';
import { PublicKey } from '@solana/web3.js';
import { walletService } from '../services/walletService';
import { solanaService } from '../services/solanaService';
import { stateManager } from '../state/stateManager';
import { keyboards } from '../utils/keyboards';
import { messages } from '../utils/messages';

export async function handleGenerateWallet(ctx: Context) {
  await ctx.answerCbQuery('Generating your new wallet...');
  const userId = ctx.from?.id;
  if (!userId) return;

  try {
    const keypair = walletService.generateWallet();
    await walletService.saveWallet(userId, keypair);

    await ctx.reply(
      messages.walletCreated(keypair.publicKey.toBase58()),
      {
        parse_mode: 'Markdown',
        ...keyboards.walletActions
      }
    );
  } catch (error) {
    console.error('Failed to generate wallet:', error);
    await ctx.reply('❌ Failed to generate wallet. Please try again.');
  }
}

export async function handleImportWallet(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  await ctx.answerCbQuery('Loading your wallets...');

  const wallets = await walletService.getUserWallets(userId);
  
  if (wallets.length === 0) {
    await ctx.reply(messages.errors.noPreviousWallets, {
      parse_mode: 'Markdown',
      ...keyboards.onlyGenerate
    });
    return;
  }

  await ctx.reply(
    messages.prompts.selectWallet, 
    keyboards.createWalletList(wallets)
  );
}

export async function handleImportSpecificWallet(ctx: Context, publicKeyStr: string) {
  const userId = ctx.from?.id;
  if (!userId) return;

  await ctx.answerCbQuery('Importing wallet...');

  const keypair = await walletService.loadWallet(userId, publicKeyStr);

  if (!keypair) {
    await ctx.reply(messages.errors.importFailed, {
      parse_mode: 'Markdown',
      ...keyboards.onlyGenerate
    });
    return;
  }

  await ctx.reply(
    messages.walletImported(keypair.publicKey.toBase58()),
    {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    }
  );
}

export async function handleShowPublicKey(ctx: Context) {
  await ctx.answerCbQuery('Getting your public key...');
  const userId = ctx.from?.id;
  if (!userId) return;

  const keypair = walletService.getActiveWallet(userId);

  if (!keypair) {
    await ctx.reply(messages.errors.noWallet, {
      parse_mode: 'Markdown',
      ...keyboards.onlyGenerate
    });
    return;
  }

  await ctx.reply(
    messages.publicKey(keypair.publicKey.toBase58()),
    {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    }
  );
}

export async function handleShowPrivateKey(ctx: Context) {
  await ctx.answerCbQuery('Retrieving private key...');
  const userId = ctx.from?.id;
  if (!userId) return;

  const privateKey = walletService.getPrivateKey(userId);

  if (!privateKey) {
    await ctx.reply(messages.errors.noWallet, {
      parse_mode: 'Markdown',
      ...keyboards.onlyGenerate
    });
    return;
  }

  await ctx.reply(
    messages.privateKey(privateKey),
    {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    }
  );
}

export async function handleCheckBalance(ctx: Context) {
  await ctx.answerCbQuery('Checking balance...');
  const userId = ctx.from?.id;
  if (!userId) return;

  const keypair = walletService.getActiveWallet(userId);

  if (!keypair) {
    await ctx.reply(messages.errors.noWallet, {
      parse_mode: 'Markdown',
      ...keyboards.onlyGenerate
    });
    return;
  }

  try {
    const balance = await solanaService.getBalance(keypair.publicKey);
    await ctx.reply(
      messages.balance(balance),
      {
        parse_mode: 'Markdown',
        ...keyboards.walletActions
      }
    );
  } catch (error) {
    console.error('Failed to check balance:', error);
    await ctx.reply(messages.errors.balanceCheckFailed, {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    });
  }
}

export async function handleAirdrop(ctx: Context) {
  await ctx.answerCbQuery('Requesting airdrop...');
  const userId = ctx.from?.id;
  if (!userId) return;

  const keypair = walletService.getActiveWallet(userId);

  if (!keypair) {
    await ctx.reply(messages.errors.noWallet, {
      parse_mode: 'Markdown',
      ...keyboards.onlyGenerate
    });
    return;
  }

  try {
    await solanaService.requestAirdrop(keypair.publicKey);
    await ctx.reply(messages.airdropSuccess(1), {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    });
  } catch (error: any) {
    console.error('Airdrop failed:', error);
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('airdrop limit') || 
        errorMessage.includes('faucet has run dry') || 
        errorMessage.includes('429')) {
      await ctx.reply(messages.errors.airdropLimit, {
        parse_mode: 'Markdown',
        ...keyboards.walletActions
      });
    } else {
      await ctx.reply(messages.errors.airdropFailed, {
        parse_mode: 'Markdown',
        ...keyboards.walletActions
      });
    }
  }
}

export async function handleViewHistory(ctx: Context) {
  await ctx.answerCbQuery('Fetching transaction history...');
  const userId = ctx.from?.id;
  if (!userId) return;

  const keypair = walletService.getActiveWallet(userId);

  if (!keypair) {
    await ctx.reply(messages.errors.noWallet, {
      parse_mode: 'Markdown',
      ...keyboards.onlyGenerate
    });
    return;
  }

  try {
    const transactions = await solanaService.getTransactionHistory(keypair.publicKey);

    if (transactions.length === 0) {
      await ctx.reply(messages.errors.noTransactions, {
        parse_mode: 'Markdown',
        ...keyboards.walletActions
      });
      return;
    }

    let message = "📊 **Recent Transaction History:**\n\n";
    for (const tx of transactions) {
      message += `🔗 **${tx.type} ${tx.amount} SOL**\n`;
      message += `📝 Signature: \`${tx.signature.slice(0, 20)}...\`\n`;
      message += `🕒 Block: ${tx.slot}\n\n`;
    }

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    });
  } catch (error) {
    console.error('Failed to fetch history:', error);
    await ctx.reply(messages.errors.historyFetchFailed, {
      parse_mode: 'Markdown',
      ...keyboards.walletActions
    });
  }
}

export async function handleSendSol(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  await ctx.answerCbQuery();
  await ctx.reply(messages.prompts.enterAddress);
  
  stateManager.setPendingRequest(userId, {
    type: 'SEND_SOL'
  });
}