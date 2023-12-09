import { useEffect, useState } from "react";
import { createLightNode, LightNode, waitForRemotePeer, Protocols } from "@waku/sdk";

declare global {
    interface Window {
      ethereum: any; // Adjust the type as per your requirement
    }
  }
  

const useNode = (): LightNode | null => {
  const [node, setNode] = useState<LightNode | null>(null);

  useEffect(() => {
    const makeNode = async () => {
      // Create and start a Light Node
      console.log('creating node')
      const _node = await createLightNode({ defaultBootstrap: true });
      console.log('starting node')
      await _node.start();
      setNode(_node);
      console.log('waiting for peer')
      waitForRemotePeer(_node, [Protocols.Store, Protocols.LightPush, Protocols.Filter]);
      console.log('peer found')
    }

    if (node === null) makeNode();
    return () => {
        
    };
  }, []);

  return node;
};

export default useNode;
