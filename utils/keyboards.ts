import { Markup } from 'telegraf';

export const keyboards = {
  main: Markup.inlineKeyboard([
    [
      Markup.button.callback('🔑 Generate Wallet', 'generate_wallet'),
      Markup.button.callback('📋 Import Wallet', 'import_wallet'),
    ],
    [
      Markup.button.callback('🔑 Show Public Key', 'show_public_key'),
    ],
  ]),

  onlyGenerate: Markup.inlineKeyboard([
    [
      Markup.button.callback('🔑 Generate Wallet', 'generate_wallet'),
      Markup.button.callback('📋 Import Wallet', 'import_wallet'),
    ],
  ]),

  walletActions: Markup.inlineKeyboard([
    [
      Markup.button.callback('💸 Send SOL', 'send_sol'),
      Markup.button.callback('🔑 Show Public Key', 'show_public_key')
    ],
    [
      Markup.button.callback('💰 Check Balance', 'check_balance'),
      Markup.button.callback('🚰 Airdrop SOL (Devnet)', 'airdrop_sol')
    ],
    [
      Markup.button.callback('📊 View Transaction History', 'view_history'),
      Markup.button.callback('🔐 Show Private Key', 'show_private_key')
    ]
  ]),

  createWalletList: (wallets: Array<{ public_key: string }>) => {
    return Markup.inlineKeyboard(
      wallets.map(w => [
        Markup.button.callback(
          `Import ${w.public_key.slice(0, 10)}...`, 
          `import_${w.public_key}`
        )
      ])
    );
  }
};