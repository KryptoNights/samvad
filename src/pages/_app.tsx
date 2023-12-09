import "@/styles/global.css";
import type { AppProps } from "next/app";
import "aos/dist/aos.css";
import { Header } from "../../components/Header/Header";
import useConnection from "../utils/connection";
import React from "react";
import {
  getBalance,
  getPost,
  testProvider,
  createReply,
} from "../utils/transition";

export default function App({ Component, pageProps }: AppProps) {
  const {
    _connectToMetaMask,
    _sendMessageToMetaMask,
    accountData,
    provider,
    signer,
  } = useConnection();

  return (
    <>
      {/* <div style={{height:"400px",width:'400px',background:'red'}} onClick={async () => createReply(1, 1, "posting from FE", true, 100000000, signer!, "sepolia")}>
    </div> */}
      {/* await signer?.getAddress())! */}
      <Header {...accountData} onConnect={_connectToMetaMask} />
      <Component {...pageProps} />
    </>
  );
}
