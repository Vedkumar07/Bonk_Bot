import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { handleStart } from './commandHandlers';
import {
  handleGenerateWallet,
  handleImportWallet,
  handleImportSpecificWallet,
  handleShowPublicKey,
  handleShowPrivateKey,
  handleCheckBalance,
  handleAirdrop,
  handleViewHistory,
  handleSendSol,
} from './actionHandlers';
import { handleTextMessage } from './messageHandlers';

export function registerHandlers(bot: Telegraf) {
  // Command handlers
  bot.start(handleStart);

  // Action handlers
  bot.action('generate_wallet', handleGenerateWallet);
  bot.action('import_wallet', handleImportWallet);
  bot.action(/^import_(.+)$/, async (ctx) => {
    const publicKeyStr = ctx.match[1];
    await handleImportSpecificWallet(ctx, publicKeyStr);
  });
  bot.action('show_public_key', handleShowPublicKey);
  bot.action('show_private_key', handleShowPrivateKey);
  bot.action('check_balance', handleCheckBalance);
  bot.action('airdrop_sol', handleAirdrop);
  bot.action('view_history', handleViewHistory);
  bot.action('send_sol', handleSendSol);

  // Text message handler
  bot.on(message('text'), handleTextMessage);
}