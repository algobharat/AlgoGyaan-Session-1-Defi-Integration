import React, { useState , useEffect } from "react";
import { useWallet, type Wallet } from "@txnlab/use-wallet-react";


export function WalletMenu() {
  const {
    algodClient,
    activeAddress,
    activeNetwork,
    setActiveNetwork,
    transactionSigner,
    wallets,
  } = useWallet();

  const [isSending, setIsSending] = React.useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});

  const handleButtonClick = (wallet: Wallet) => {
    if (wallet.isConnected) {
      wallet.disconnect();
    } else {
      wallet.connect();
    }
  };

  useEffect(() => {
    const fetchBalances = async () => {
      const newBalances: { [key: string]: number } = {};
      for (const wallet of wallets) {
        if (wallet.isConnected) {
          const accountInfo = await algodClient.accountInformation(wallet.accounts[0].address).do();
          newBalances[wallet.id] = accountInfo.amount / 1_000_000; // Convert microAlgos to Algos
        }
      }
      setBalances(newBalances);
    };
    fetchBalances();
  }, [wallets, algodClient]);



  return (
    <div>
      {wallets.map((wallet) => (
        <div key={wallet.id} className="flex items-center justify-between mb-4">
          
            <button
              type="button"
              onClick={() => handleButtonClick(wallet)}
              className="bg-black text-white rounded-lg border-2 border-transparent hover:border-blue-500 transition duration-300 px-4 py-2 flex items-center justify-center font-bold"
            >
              {wallet.isConnected ? "Disconnect" : "Connect"}
            </button>
            {wallet.isConnected && (
            <div className="ml-4 p-2 bg-gray-100 rounded-lg shadow-md text-sm text-gray-600 flex items-center w-48">
              Bal: {balances[wallet.id] !== undefined ? `${balances[wallet.id]} Algos` : 'Loading...'}
            </div>
          )}
          </div>
        
      ))}
    </div>
  );
}