import { create } from 'zustand';

export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  token: 'SOL' | 'SKR';
  amount: string;
  address: string;
  label?: string;
  timestamp: Date;
  status: 'confirmed' | 'pending' | 'failed';
  txSignature?: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  emoji: string;
  lastUsed?: Date;
}

interface WalletStore {
  // Wallet state
  connected: boolean;
  publicKey: string | null;
  solBalance: number;
  skrBalance: number;
  solPriceUSD: number;

  // Transactions
  transactions: Transaction[];

  // Contacts
  contacts: Contact[];

  // Actions
  connect: (publicKey: string) => void;
  disconnect: () => void;
  setSolBalance: (bal: number) => void;
  setSkrBalance: (bal: number) => void;
  addTransaction: (tx: Transaction) => void;
  updateTxStatus: (id: string, status: Transaction['status']) => void;
}

// Mock contacts
const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Rahul Dev', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', emoji: '👨‍💻', lastUsed: new Date() },
  { id: '2', name: 'Priya Singh', address: 'BQcdHdAQW1hcGapkqMTurdqe5WxirieC3APjTFGBFGSZ', emoji: '👩‍🎨' },
  { id: '3', name: 'Arjun SOL', address: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy', emoji: '🧑‍🚀' },
  { id: '4', name: 'Merchant QR', address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', emoji: '🏪' },
  { id: '5', name: 'Seeker Team', address: 'So1ana111111111111111111111111111111111111111', emoji: '🔮' },
];

// Mock transactions
const MOCK_TXS: Transaction[] = [
  {
    id: '1', type: 'sent', token: 'SOL', amount: '0.5',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    label: 'Rahul Dev', timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: 'confirmed', txSignature: '5KG9mPwN3nQ2vXtJhL8RcYsB1dA4eZfMo6uTkWpViCg7nE'
  },
  {
    id: '2', type: 'received', token: 'SKR', amount: '100',
    address: 'BQcdHdAQW1hcGapkqMTurdqe5WxirieC3APjTFGBFGSZ',
    label: 'Priya Singh', timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'confirmed', txSignature: 'abc123'
  },
  {
    id: '3', type: 'sent', token: 'SOL', amount: '1.2',
    address: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy',
    label: 'Arjun SOL', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    status: 'confirmed'
  },
  {
    id: '4', type: 'received', token: 'SOL', amount: '2.0',
    address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    label: 'Merchant QR', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'confirmed'
  },
  {
    id: '5', type: 'sent', token: 'SKR', amount: '250',
    address: 'So1ana111111111111111111111111111111111111111',
    label: 'Seeker Team', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
    status: 'failed'
  },
];

export const useWalletStore = create<WalletStore>((set) => ({
  connected: false,
  publicKey: null,
  solBalance: 0,
  skrBalance: 0,
  solPriceUSD: 148.23,
  transactions: MOCK_TXS,
  contacts: MOCK_CONTACTS,

  connect: (publicKey) => set({
    connected: true,
    publicKey,
    solBalance: 2.0,
    skrBalance: 500,
  }),

  disconnect: () => set({
    connected: false,
    publicKey: null,
    solBalance: 0,
    skrBalance: 0,
  }),

  setSolBalance: (bal) => set({ solBalance: bal }),
  setSkrBalance: (bal) => set({ skrBalance: bal }),

  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions],
  })),

  updateTxStatus: (id, status) => set((state) => ({
    transactions: state.transactions.map(tx =>
      tx.id === id ? { ...tx, status } : tx
    ),
  })),
}));

export { MOCK_CONTACTS };