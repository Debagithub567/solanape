import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';

export const DEVNET_CONNECTION = new Connection('https://api.devnet.solana.com', 'confirmed');

// Mock SKR token mint address on devnet (placeholder - replace with real mint after creation)
export const SKR_MINT_ADDRESS = 'SKRmockMintAddressDevnet111111111111111111111';
export const SKR_DECIMALS = 6;
export const SKR_SYMBOL = 'SKR';
export const SKR_NAME = 'Seeker Token';

export const SOL_SYMBOL = 'SOL';

// Shorten address for display
export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Format balance nicely
export const formatBalance = (balance: number, decimals = 4): string => {
  if (balance === 0) return '0';
  if (balance < 0.0001) return '< 0.0001';
  return balance.toFixed(decimals).replace(/\.?0+$/, '');
};

// Format USD value
export const formatUSD = (solAmount: number, priceUSD: number): string => {
  const value = solAmount * priceUSD;
  if (value < 0.01) return '< $0.01';
  return `$${value.toFixed(2)}`;
};

// Airdrop SOL on devnet (for testing)
export const airdropSOL = async (address: string, amount = 1): Promise<string> => {
  try {
    const pubkey = new PublicKey(address);
    const sig = await DEVNET_CONNECTION.requestAirdrop(
      pubkey,
      amount * LAMPORTS_PER_SOL
    );
    await DEVNET_CONNECTION.confirmTransaction(sig);
    return sig;
  } catch (err: any) {
    throw new Error(`Airdrop failed: ${err.message}`);
  }
};

// Get SOL balance
export const getSOLBalance = async (address: string): Promise<number> => {
  try {
    const pubkey = new PublicKey(address);
    const lamports = await DEVNET_CONNECTION.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
};

// Mock send SOL (returns a fake signature for UI testing when wallet adapter not available)
export const mockSendSOL = async (
  fromAddress: string,
  toAddress: string,
  amount: number
): Promise<{ signature: string; status: 'confirmed' | 'failed' }> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1500));

  // Simulate 90% success rate
  if (Math.random() > 0.1) {
    const fakeSig = Array.from({ length: 44 }, () =>
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[
        Math.floor(Math.random() * 58)
      ]
    ).join('');
    return { signature: fakeSig, status: 'confirmed' };
  }
  return { signature: '', status: 'failed' };
};

// Mock send SKR (same pattern)
export const mockSendSKR = async (
  fromAddress: string,
  toAddress: string,
  amount: number
): Promise<{ signature: string; status: 'confirmed' | 'failed' }> => {
  await new Promise(r => setTimeout(r, 1800));
  if (Math.random() > 0.1) {
    const fakeSig = Array.from({ length: 44 }, () =>
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[
        Math.floor(Math.random() * 58)
      ]
    ).join('');
    return { signature: fakeSig, status: 'confirmed' };
  }
  return { signature: '', status: 'failed' };
};

// Validate Solana address
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Time ago formatter
export const timeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Generate a mock devnet wallet for testing
export const generateMockWallet = (): { publicKey: string } => {
  const keypair = Keypair.generate();
  return { publicKey: keypair.publicKey.toString() };
};

// Devnet explorer URL
export const getTxExplorerUrl = (signature: string): string =>
  `https://explorer.solana.com/tx/${signature}?cluster=devnet`;