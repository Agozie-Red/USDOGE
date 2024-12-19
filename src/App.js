import React, { useState } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { CONTRACT_ADDRESS, ABI } from "./constants";

function App() {
  const [bnbAmount, setBnbAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletConnectProvider, setWalletConnectProvider] = useState(null);

  const connectWallet = async () => {
    try {
      let provider;

      if (window.ethereum) {
        // Desktop MetaMask
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
      } else {
        // WalletConnect for mobile
        const wcProvider = new WalletConnectProvider({
          rpc: {
            1: "https://mainnet.infura.io/v3/69fc40f8df4f46f28d1acb0ec3bab3c9",
          },
        });

        await wcProvider.enable();
        provider = new ethers.providers.Web3Provider(wcProvider);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setWalletConnectProvider(wcProvider);
      }

      alert(`Connected wallet: ${walletAddress}`);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet.");
    }
  };

  const disconnectWallet = async () => {
    if (walletConnectProvider) {
      await walletConnectProvider.disconnect();
      setWalletAddress("");
      setWalletConnectProvider(null);
      alert("Disconnected from wallet.");
    }
  };

  const buyTokens = async () => {
    if (!bnbAmount || isNaN(bnbAmount) || parseFloat(bnbAmount) <= 0) {
      return alert("Enter a valid BNB amount.");
    }

    try {
      setLoading(true);
      const provider = walletConnectProvider
        ? new ethers.providers.Web3Provider(walletConnectProvider)
        : new ethers.providers.Web3Provider(window.ethereum);

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-center mb-4">USDOGE Presale</h1>
        <div className="flex justify-between items-center">
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {walletAddress
              ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Connect Wallet"}
          </button>
          {walletAddress && (
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Disconnect
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <input
          type="number"
          placeholder="Enter BNB amount"
          value={bnbAmount}
          onChange={(e) => setBnbAmount(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
        />
        <button
          onClick={buyTokens}
          disabled={loading}
          className={`w-full px-4 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading ? "Processing..." : "Buy Tokens"}
        </button>
      </main>
    </div>
  );
}

export default App;
