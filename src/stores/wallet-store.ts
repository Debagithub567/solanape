import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WalletState {
  publicKey: string | null;
  balance: number | null;
  lastBalance: number | null;
  lastConnectedTime: string | null;
  isConnected: boolean;
  favorites: string[];
  searchHistory: string[];
  isDevnet: boolean;

  setConnected: (publicKey: string, balance: number) => void;
  setBalance: (balance: number) => void;
  setDisconnected: () => void;
  addFavorite: (address: string) => void;
  removeFavorite: (address: string) => void;
  isFavorite: (address: string) => boolean;
  addToHistory: (address: string) => void;
  clearHistory: () => void;
  toggleNetwork: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      publicKey: null,
      balance: null,
      lastBalance: null,
      lastConnectedTime: null,
      isConnected: false,
      favorites: [],
      searchHistory: [],
      isDevnet: true,

      setConnected: (publicKey, balance) =>
        set({
          publicKey,
          balance,
          isConnected: true,
          lastBalance: balance,
          lastConnectedTime: new Date().toLocaleTimeString(),
        }),

      setBalance: (balance) =>
        set({
          balance,
          lastBalance: balance,
        }),

      setDisconnected: () =>
        set((state) => ({
          publicKey: null,
          balance: null,
          isConnected: false,
          lastBalance: state.balance ?? state.lastBalance,
          lastConnectedTime: new Date().toLocaleTimeString(),
        })),

      addFavorite: (address) =>
        set((state) => ({
          favorites: state.favorites.includes(address)
            ? state.favorites
            : [address, ...state.favorites],
        })),

      removeFavorite: (address) =>
        set((state) => ({
          favorites: state.favorites.filter((a) => a !== address),
        })),

      isFavorite: (address) => get().favorites.includes(address),

      addToHistory: (address) =>
        set((state) => ({
          searchHistory: [
            address,
            ...state.searchHistory.filter((a) => a !== address),
          ].slice(0, 20),
        })),

      clearHistory: () => set({ searchHistory: [] }),

      toggleNetwork: () =>
        set((state) => ({
          isDevnet: !state.isDevnet,
          isConnected: false,
          publicKey: null,
          balance: null,
        })),
    }),
    {
      name: "solanape-wallet-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastBalance: state.lastBalance,
        lastConnectedTime: state.lastConnectedTime,
        isDevnet: state.isDevnet,
        favorites: state.favorites,
        searchHistory: state.searchHistory,
      }),
    }
  )
);