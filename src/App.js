import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./constants";
import './index.css';


function App() {
  const [bnbAmount, setBnbAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
      } else {
        alert("MetaMask not detected. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet.");
    }
  };

  const buyTokens = async () => {
    if (!bnbAmount || isNaN(bnbAmount) || parseFloat(bnbAmount) <= 0) {
      return alert("Enter a valid BNB amount.");
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const value = ethers.utils.parseEther(bnbAmount);
      const tx = await contract.buyTokens({ value });
      await tx.wait();

      alert("Tokens purchased successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Transaction failed.");
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
      </header>
      <main className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
        <input
          type="number"
          placeholder="Enter BNB amount"
          value={bnbAmount}
          onChange={(e) => setBnbAmount(e.target.value)}
          className="w-full px-4 py-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={buyTokens}
          disabled={loading}
          className={`w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-center ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Processing..." : "Buy Tokens"}
        </button>
      </main>
      <footer className="mt-10 text-sm text-gray-500">
        Powered by MetaMask and ethers.js
      </footer>
    </div>
  );
}

export default App;
