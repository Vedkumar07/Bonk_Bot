import { Context } from 'telegraf';
import { keyboards } from '../utils/keyboards';
import { messages } from '../utils/messages';

export async function handleStart(ctx: Context) {
  return ctx.reply(messages.welcome, {
    parse_mode: 'Markdown',
    ...keyboards.main
  });
}