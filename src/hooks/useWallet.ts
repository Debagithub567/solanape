import { useState, useCallback } from "react";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { useWalletStore } from "../stores/wallet-store";

const APP_IDENTITY = {
  name: "SolanaPe",
  uri: "https://solanape.app",
  icon: "favicon.ico",
};

export function useWallet() {
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);

  const publicKeyString = useWalletStore((s) => s.publicKey);
  const balance = useWalletStore((s) => s.balance);
  const isConnected = useWalletStore((s) => s.isConnected);
  const isDevnet = useWalletStore((s) => s.isDevnet);

  // ✅ Moved inside the function (were incorrectly at the top of the file)
  const lastBalance = useWalletStore((s) => s.lastBalance);
  const lastConnectedTime = useWalletStore((s) => s.lastConnectedTime);

  const setConnected = useWalletStore((s) => s.setConnected);
  const setBalance = useWalletStore((s) => s.setBalance);
  const setDisconnected = useWalletStore((s) => s.setDisconnected);

  const cluster = isDevnet ? "devnet" : "mainnet-beta";
  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

  const publicKey = publicKeyString ? new PublicKey(publicKeyString) : null;

  const connect = useCallback(async () => {
    setConnecting(true);

    try {
      const authResult = await transact(async (wallet: Web3MobileWallet) => {
        const result = await wallet.authorize({
          chain: `solana:${cluster}`,
          identity: APP_IDENTITY,
        });

        return result;
      });

      const pubkey = new PublicKey(
        Buffer.from(authResult.accounts[0].address, "base64")
      );

      const bal = await connection.getBalance(pubkey);
      const solBalance = bal / LAMPORTS_PER_SOL;

      setConnected(pubkey.toBase58(), solBalance);

      return pubkey;
    } catch (error) {
      console.error("Connect failed:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);

  const disconnect = useCallback(() => {
    setDisconnected();
  }, []);

  const getBalance = useCallback(async () => {
    if (!publicKey) return 0;

    const bal = await connection.getBalance(publicKey);
    const solBalance = bal / LAMPORTS_PER_SOL;

    setBalance(solBalance);

    return solBalance;
  }, [publicKey]);

  const sendSOL = useCallback(
    async (toAddress: string, amountSOL: number) => {
      if (!publicKey) throw new Error("Wallet not connected");

      setSending(true);

      try {
        const toPublicKey = new PublicKey(toAddress);

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toPublicKey,
            lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();

        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signature = await transact(async (wallet: Web3MobileWallet) => {
          await wallet.authorize({
            chain: `solana:${cluster}`,
            identity: APP_IDENTITY,
          });

          const signatures = await wallet.signAndSendTransactions({
            transactions: [transaction],
          });

          return signatures[0];
        });

        await getBalance();

        return signature;
      } finally {
        setSending(false);
      }
    },
    [publicKey, cluster]
  );

  return {
    publicKey,
    connected: isConnected,
    connecting,
    sending,
    balance,
    lastBalance,           // ✅ now exposed
    lastConnectedTime,     // ✅ now exposed
    connect,
    disconnect,
    getBalance,
    sendSOL,
    connection,
  };
}