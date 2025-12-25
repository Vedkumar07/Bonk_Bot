import { Telegraf } from 'telegraf';
import { initDB, getPgVersion } from './database/db';
import { registerHandlers } from './handlers';
import { config } from './config';

async function main() {
  await getPgVersion();
  await initDB();
  const bot = new Telegraf(config.BOT_TOKEN);
  registerHandlers(bot);
  await bot.launch();
  console.log('✅ Bot is running...');
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});