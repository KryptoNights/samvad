import { useEffect, useState } from "react";
import { createLightNode, LightNode, waitForRemotePeer, Protocols, createDecoder } from "@waku/sdk";
import { Liveliness } from "../../components/Blog/Blog";

declare global {
    interface Window {
      ethereum: any; // Adjust the type as per your requirement
    }
  }

// Choose a content topic
const contentTopic = `/samvad/0/posts/proto`;

// Create a message decoder
const decoder = createDecoder(contentTopic);

const useNode = (): [LightNode | null, Array<any>] => {
  const [node, setNode] = useState<LightNode | null>(null);
  const [messages, setMessages] = useState<Array<any>>([]);

  useEffect(() => {
    const makeNode = async () => {
      // Create and start a Light Node
      console.log('creating node')
      const _node = await createLightNode({ defaultBootstrap: true });
      console.log('starting node')
      await _node.start();
      setNode(_node);
      console.log('waiting for peer')
      await waitForRemotePeer(_node, [Protocols.Store, Protocols.LightPush, Protocols.Filter]);
      console.log('peer found')
      // await new Promise( resolve => setTimeout(resolve, 2000) );

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 1000 * 60 * 60 * 24); // 1 hours ago
      const _messages: any = []
      const callback = (wakuMessage: any) => {
        _messages.push(Liveliness.decode(wakuMessage.payload));
        // Return "true" to stop retrieving pages
        // Here, it retrieves only the first page
        if (_messages.length >= 100) return true;
      };
      await _node.store.queryWithOrderedCallback(
        [decoder],
        callback,
        {timeFilter: {startTime, endTime}}
      );
      setMessages(_messages);
    }

    if (node === null) makeNode();
  }, []);

  return [node, messages];
};

export default useNode;
