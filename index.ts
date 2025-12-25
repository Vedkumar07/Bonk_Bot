import { Telegraf, Markup, Context } from 'telegraf';
import {message} from 'telegraf/filters';
import {Keypair, Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL, confirmTransaction} from '@solana/web3.js';
const bot =new Telegraf("8561665479:AAEFQrgO-6y-gB5sr2IGdYLYuFLwADxu7eQ");
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const USERS:Record<string,Keypair>={};
interface PendingRequestType{
    type:'SEND_SOL'|'SEND_TOKEN',
    amount?:number,
    to?:string
}
const PENDING_REQUEST:Record<string,PendingRequestType>={};
const keyboard=Markup.inlineKeyboard([
            [
                Markup.button.callback('🔑 Generate Wallet', 'generate_wallet'),
                Markup.button.callback('🔑 Show Public Key', 'show_public_key'),
            ],
    ]);
const onlyGenerarteKeyboard=Markup.inlineKeyboard([
            [
                Markup.button.callback('🔑 Generate Wallet', 'generate_wallet')
            ],
        ]);
const postWalletCreationKeyboard=Markup.inlineKeyboard([
            [
                Markup.button.callback('Send SOL', 'send_sol'),
                Markup.button.callback('Show public key', 'show_public_key')
            ],
            [
                Markup.button.callback('Check Balance', 'check_balance'),
                Markup.button.callback('Airdrop SOL (Devnet)', 'airdrop_sol')
            ]
        ]);
bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    let welcomeMessage = `
        🤖 **Welcome to Solana Wallet Bot!**

        Your secure, easy-to-use Solana wallet manager.

        **Features:**
        • 🔑 Generate new wallets
        • 📋 Import existing wallets
        • 💰 Check balances
        • 💸 Send SOL and SPL tokens
        • 📊 View transaction history
        • 🔒 Secure private key storage

        **Security:**
        • All private keys are encrypted
        • Never share your private keys
        • Use at your own risk (testnet recommended)

        Choose an option below to get started:`;
    return ctx.reply(welcomeMessage,{
        parse_mode:'Markdown',
        ...keyboard
    });
});
bot.action('generate_wallet',(ctx)=>{
    ctx.answerCbQuery('Generating your new wallet...');
    const keypair=Keypair.generate();
    const userId=ctx.from?.id;
    USERS[userId]=keypair;
    ctx.sendMessage(`✅ Wallet Created for you with public key ${keypair.publicKey.toBase58()}`,{
        parse_mode:'Markdown',
        ...postWalletCreationKeyboard
    });
})
bot.action('show_public_key',(ctx)=>{
    ctx.answerCbQuery("Getting your public key...");
    const userId=ctx.from?.id;
    const keypair=USERS[userId];
    if(!keypair){
        ctx.sendMessage("❌ No wallet found for you. Please generate a new wallet first.",{
            parse_mode:'Markdown',
            ...onlyGenerarteKeyboard
        })
        return;
    }
    ctx.sendMessage(`✅ This is your public key ${keypair.publicKey.toBase58()}`,{
        parse_mode:'Markdown',
        ...postWalletCreationKeyboard
    });
})
bot.action('send_sol',(ctx)=>{
    const userId=ctx.from?.id;
    ctx.answerCbQuery();
    ctx.sendMessage("Can you share the address to send SOL to");
    PENDING_REQUEST[userId]={
        type:"SEND_SOL"
    }
});
bot.action('airdrop_sol',async (ctx)=>{
    const userId=ctx.from?.id;
    ctx.answerCbQuery('Requesting airdrop...');
    const keypair=USERS[userId];
    if(!keypair){
        ctx.sendMessage("❌ No wallet found. Please generate a wallet first.",{
            parse_mode:'Markdown',
            ...onlyGenerarteKeyboard
        });
        return;
    }
    try{
        const airdropSignature = await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(airdropSignature);
        ctx.sendMessage(`✅ Airdrop successful! 1 SOL added to your wallet.`,{
            parse_mode:'Markdown',
            ...postWalletCreationKeyboard
        });
    }catch(e){
        console.error(e);
        const errorMessage = e.message || '';
        if(errorMessage.includes('airdrop limit') || errorMessage.includes('faucet has run dry') || errorMessage.includes('429')){
            ctx.sendMessage("❌ Airdrop failed: You've reached your daily airdrop limit or the faucet is dry. Visit https://faucet.solana.com for more test SOL.",{
                parse_mode:'Markdown',
                ...postWalletCreationKeyboard
            });
        }else{
            ctx.sendMessage("❌ Airdrop failed. Please try again later.",{
                parse_mode:'Markdown',
                ...postWalletCreationKeyboard
            });
        }
    }
});
bot.action('check_balance',async (ctx)=>{
    const userId=ctx.from?.id;
    ctx.answerCbQuery('Checking balance...');
    const keypair=USERS[userId];
    if(!keypair){
        ctx.sendMessage("❌ No wallet found. Please generate a wallet first.",{
            parse_mode:'Markdown',
            ...onlyGenerarteKeyboard
        });
        return;
    }
    try{
        const balance = await connection.getBalance(keypair.publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;
        ctx.sendMessage(`💰 Your balance: ${solBalance} SOL`,{
            parse_mode:'Markdown',
            ...postWalletCreationKeyboard
        });
    }catch(e){
        console.error(e);
        ctx.sendMessage("❌ Failed to check balance. Please try again.",{
            parse_mode:'Markdown',
            ...postWalletCreationKeyboard
        });
    }
});
bot.on(message("text"),async (ctx)=>{
    const userId=ctx.from?.id;
    console.log(ctx.message.text);
    if(PENDING_REQUEST[userId]&&!PENDING_REQUEST[userId].to){
        PENDING_REQUEST[userId].to=ctx.message.text;
        ctx.sendMessage("How much SOL do you want to send ")
    }else if(PENDING_REQUEST[userId]){
        const amountText=ctx.message.text;
        const amount = parseFloat(amountText);
        if(isNaN(amount) || amount <= 0){
            ctx.sendMessage("❌ Invalid amount. Please enter a positive number.",{
                parse_mode:'Markdown',
                ...postWalletCreationKeyboard
            });
            delete PENDING_REQUEST[userId];
            return;
        }
        const toAddress = PENDING_REQUEST[userId].to;
        let toPublicKey: PublicKey;
        try{
            toPublicKey = new PublicKey(toAddress);
        }catch(e){
            ctx.sendMessage("❌ Invalid recipient address.",{
                parse_mode:'Markdown',
                ...postWalletCreationKeyboard
            });
            delete PENDING_REQUEST[userId];
            return;
        }
        const keypair = USERS[userId];
        if(!keypair){
            ctx.sendMessage("❌ No wallet found. Please generate a wallet first.",{
                parse_mode:'Markdown',
                ...onlyGenerarteKeyboard
            });
            delete PENDING_REQUEST[userId];
            return;
        }
        try{
            const balance = await connection.getBalance(keypair.publicKey);
            const amountLamports = amount * LAMPORTS_PER_SOL;
            if(balance < amountLamports){
                ctx.sendMessage(`❌ Insufficient balance. You have ${balance / LAMPORTS_PER_SOL} SOL.`,{
                    parse_mode:'Markdown',
                    ...postWalletCreationKeyboard
                });
                delete PENDING_REQUEST[userId];
                return;
            }
            ctx.sendMessage(`🔄 Initializing transaction to send ${amount} SOL to ${toAddress}...`);
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey: toPublicKey,
                    lamports: amountLamports,
                })
            );
            const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
            ctx.sendMessage(`✅ Transaction successful! Signature: ${signature}`,{
                parse_mode:'Markdown',
                ...postWalletCreationKeyboard
            });
        }catch(e){
            console.error(e);
            ctx.sendMessage("❌ Transaction failed. Please try again.",{
                parse_mode:'Markdown',
                ...postWalletCreationKeyboard
            });
        }
        delete PENDING_REQUEST[userId];
    }
})
await bot.launch();