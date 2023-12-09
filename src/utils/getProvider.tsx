import { useEffect, useState } from "react";
import { ethers,Provider } from "ethers";

type ProviderType = Provider;
type SignerType = ethers.Signer | null;

declare global {
    interface Window {
      ethereum: any; // Adjust the type as per your requirement
    }
  }
  

const useEthersProviderAndSigner = (): [ProviderType, SignerType] => {
  const [provider, setProvider] = useState<ProviderType>(
    ethers.getDefaultProvider("mainnet")
  );
  const [signer, setSigner] = useState<SignerType>(null);

  useEffect(() => {
    const checkMetaMask = async () => {
      if ((window as any).ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults");
      } else {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const fetchedSigner =  await new ethers.BrowserProvider(window.ethereum).getSigner();
        setProvider(browserProvider);
        setSigner(fetchedSigner);
      }
    };

    checkMetaMask();
    return () => {
        
    };
  }, []);

  return [provider, signer];
};

export default useEthersProviderAndSigner;
