import { Telegraf, Markup, Context } from 'telegraf';
import {message} from 'telegraf/filters';
import {Keypair, Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL, confirmTransaction} from '@solana/web3.js';
import { neon } from '@neondatabase/serverless';
import { decode, encode } from 'bs58';
import { createCipher, createDecipher } from 'crypto';
const sql = neon(process.env.POSTGRES_URL!);
async function getPgVersion() {
  const result = await sql`SELECT version()`;
  console.log(result[0]);
}

async function initDB() {
  await sql`CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    public_key TEXT NOT NULL UNIQUE,
    private_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

getPgVersion();
initDB();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-prod';

function encrypt(text: string): string {
    const cipher = createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encrypted: string): string {
    const decipher = createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
const bot =new Telegraf("8561665479:AAEFQrgO-6y-gB5sr2IGdYLYuFLwADxu7eQ");
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const USERS:Record<string,Keypair>={};
interface PendingRequestType{
    type:'SEND_SOL'|'SEND_TOKEN'|'IMPORT_WALLET',
    amount?:number,
    to?:string
}
const PENDING_REQUEST:Record<string,PendingRequestType>={};
const keyboard=Markup.inlineKeyboard([
            [
                Markup.button.callback('🔑 Generate Wallet', 'generate_wallet'),
                Markup.button.callback('� Import Wallet', 'import_wallet'),
            ],
            [
                Markup.button.callback('�🔑 Show Public Key', 'show_public_key'),
            ],
    ]);
const onlyGenerarteKeyboard=Markup.inlineKeyboard([
            [
                Markup.button.callback('🔑 Generate Wallet', 'generate_wallet'),
                Markup.button.callback('📋 Import Wallet', 'import_wallet'),
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
            ],
            [
                Markup.button.callback('📊 View Transaction History', 'view_history'),
                Markup.button.callback('🔑 Show Private Key', 'show_private_key')
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
bot.action('generate_wallet',async (ctx)=>{
    ctx.answerCbQuery('Generating your new wallet...');
    const keypair=Keypair.generate();
    const userId=ctx.from?.id;
    USERS[userId]=keypair;
    const privateKeyEncoded = encode(keypair.secretKey);
    const encryptedPrivateKey = encrypt(privateKeyEncoded);
    try {
        await sql`INSERT INTO wallets (user_id, public_key, private_key) VALUES (${userId}, ${keypair.publicKey.toBase58()}, ${encryptedPrivateKey})`;
        console.log(`Wallet saved to DB for user ${userId}`);
    } catch (e) {
        console.error('Failed to save wallet to DB:', e);
    }
    ctx.sendMessage(`✅ Wallet Created for you with public key ${keypair.publicKey.toBase58()}`,{
        parse_mode:'Markdown',
        ...postWalletCreationKeyboard
    });
})
bot.action('import_wallet',async (ctx)=>{
    const userId=ctx.from?.id;
    ctx.answerCbQuery('Loading your wallets...');
    const wallets = await sql`SELECT public_key FROM wallets WHERE user_id = ${userId}`;
    if(wallets.length === 0){
        ctx.sendMessage("❌ No previous wallets found. Please generate a new wallet first.",{
            parse_mode:'Markdown',
            ...onlyGenerarteKeyboard
        });
        return;
    }
    const importKeyboard = Markup.inlineKeyboard(
        wallets.map(w => [Markup.button.callback(`Import ${w.public_key.slice(0, 10)}...`, `import_${w.public_key}`)])
    );
    ctx.sendMessage("Select a wallet to import:", importKeyboard);
})
bot.action(/^import_(.+)$/, async (ctx) => {
    const publicKeyStr = ctx.match[1];
    const userId = ctx.from?.id;
    ctx.answerCbQuery('Importing wallet...');
    const wallet = await sql`SELECT private_key FROM wallets WHERE user_id = ${userId} AND public_key = ${publicKeyStr}`;
    if(wallet.length === 0){
        ctx.sendMessage("❌ Wallet not found.",{
            parse_mode:'Markdown',
            ...onlyGenerarteKeyboard
        });
        return;
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
        USERS[userId] = keypair;
        ctx.sendMessage(`✅ Wallet imported successfully! Public key: ${keypair.publicKey.toBase58()}`,{
            parse_mode:'Markdown',
            ...postWalletCreationKeyboard
        });
    } catch(e) {
        ctx.sendMessage("❌ Failed to import wallet.",{
            parse_mode:'Markdown',
            ...onlyGenerarteKeyboard
        });
    }
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
bot.action('view_history',async (ctx)=>{
    const userId=ctx.from?.id;
    ctx.answerCbQuery('Fetching transaction history...');
    const keypair=USERS[userId];
    if(!keypair){
        ctx.sendMessage("❌ No wallet found. Please generate a wallet first.",{
            parse_mode:'Markdown',
            ...onlyGenerarteKeyboard
        });
        return;
    }
    try{
        const signatures = await connection.getSignaturesForAddress(keypair.publicKey, {limit: 10});
        if(signatures.length === 0){
            ctx.sendMessage("📊 No transactions found for this wallet.",{
                parse_mode:'Markdown',
                ...postWalletCreationKeyboard
            });
            return;
        }
        let message = "📊 **Recent Transaction History:**\n\n";
        for(const sig of signatures){
            const tx = await connection.getTransaction(sig.signature);
            if(tx && tx.meta){
                const amount = Math.abs(tx.meta.preBalances[0] - tx.meta.postBalances[0]) / LAMPORTS_PER_SOL;
                const type = tx.meta.preBalances[0] > tx.meta.postBalances[0] ? 'Sent' : 'Received';
                message += `🔗 **${type} ${amount} SOL**\n`;
                message += `📝 Signature: \`${sig.signature.slice(0,20)}...\`\n`;
                message += `🕒 Block: ${sig.slot}\n\n`;
            }
        }
        ctx.sendMessage(message,{
            parse_mode:'Markdown',
            ...postWalletCreationKeyboard
        });
    }catch(e){
        console.error(e);
        ctx.sendMessage("❌ Failed to fetch transaction history. Please try again.",{
            parse_mode:'Markdown',
            ...postWalletCreationKeyboard
        });
    }
});
bot.action('show_private_key',async (ctx)=>{
    const userId=ctx.from?.id;
    ctx.answerCbQuery('Retrieving private key...');
    const keypair=USERS[userId];
    if(!keypair){
        ctx.sendMessage("❌ No wallet found. Please generate a wallet first.",{
            parse_mode:'Markdown',
            ...onlyGenerarteKeyboard
        });
        return;
    }
    const privateKeyEncoded = encode(keypair.secretKey);
    ctx.sendMessage(`⚠️ **WARNING: Never share your private key!**\n\n🔑 **Private Key:** \`${privateKeyEncoded}\`\n\nThis key gives full access to your wallet. Keep it secure and never share it with anyone.`,{
        parse_mode:'Markdown',
        ...postWalletCreationKeyboard
    });
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