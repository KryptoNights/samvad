import { useState } from "react";
import { useCallback } from "react";
import React from "react";
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
  // const dispatch = useDispatch();
  // console.log('daa',signer)

  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  React.useEffect(() => {
    const storedWalletData = localStorage.getItem("walletData");
    if (storedWalletData) {
      const parsedData = JSON.parse(storedWalletData);
      setAccountData(parsedData);
    }
  }, []);

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

        const preparedData = {
          address,
          balance: ethers.utils.formatEther(balance),
          chainId: network.chainId.toString(),
          network: network.name,
        };
        setAccountData(preparedData);
        // dispatch(setWalletInfo(preparedData));

        localStorage.setItem("walletData", JSON.stringify(preparedData));
      } catch (error: Error | any) {
        alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
      }
    } else {
      alert("MetaMask not installed");
    }
  }, []);

  const _disconnectFromMetaMask = useCallback(async () => {
    console.log("here");
    setAccountData({});
    localStorage.removeItem("walletData");
  }, []);

  const _sendMessageToMetaMask = useCallback(async () => {
    const ethereum: any = await window.ethereum;
    // Create an ethers.js provider using the injected provider from MetaMask
    // And get the signer (account) from the provider
    const signer = await new ethers.providers.Web3Provider(ethereum).getSigner();
    try {
      // Sign the message
      console.log("ass", signer);
      await signer.signMessage("asss");
    } catch (error) {
      alert("User denied message signature.");
    }
  }, [message]);

  return {
    _connectToMetaMask,
    _sendMessageToMetaMask,
    _disconnectFromMetaMask,
    accountData,
    provider,
    signer,
  };
};

export default useConnection;
