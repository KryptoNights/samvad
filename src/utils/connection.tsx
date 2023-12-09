import { useState } from "react";
import { useCallback } from "react";
import { ethers } from "ethers";
import useEthersProviderAndSigner from "./getProvider";

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

const useConnection = () => {
  const [accountData, setAccountData] = useState<AccountType>({});
  const [message, setMessage] = useState<string>("");
  const [provider, signer] = useEthersProviderAndSigner();

  // console.log('daa',signer)
   
  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const _connectToMetaMask = useCallback(async () => {
    const ethereum = window.ethereum;
    // Check if MetaMask is installed
    if (typeof ethereum !== "undefined") {
      try {
        // Request access to the user's MetaMask accounts
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        // Get the connected Ethereum address
        const address = accounts[0];
        // Create an ethers.js provider using the injected provider from MetaMask
        // const provider = new ethers.BrowserProvider(ethereum);
        // Get the account balance
        const balance = await provider.getBalance(address);
        // Get the network ID from MetaMask
        const network = await provider.getNetwork();
        // Update state with the results
        setAccountData({
          address,
          balance: ethers.formatEther(balance),
          // The chainId property is a bigint, change to a string
          chainId: network.chainId.toString(),
          network: network.name,
        });
        
      } catch (error: Error | any) {
        alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
      }
    } else {
      alert("MetaMask not installed");
    }
  }, []);

  const _sendMessageToMetaMask = useCallback(async () => {
    const ethereum :any= await window.ethereum;
    // Create an ethers.js provider using the injected provider from MetaMask
    // And get the signer (account) from the provider
     const signer = await new ethers.BrowserProvider(ethereum).getSigner();
    try {
      // Sign the message
      console.log('ass',signer)
      await signer.signMessage("asss");
    } catch (error) {
      alert("User denied message signature.");
    }
  }, [message]);



  return {
    _connectToMetaMask,
    _sendMessageToMetaMask,
    accountData,
    provider,
    signer
  };
};

export default useConnection;


