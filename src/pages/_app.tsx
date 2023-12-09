import "@/styles/global.css";
import type { AppProps } from "next/app";
import "aos/dist/aos.css";
import { Provider } from "react-redux";
import { useStore } from "react-redux";
import useConnection from "../utils/connection";
import React from "react";
import { wrapper } from "./../store/index";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useTransactions from "@/utils/useTransactions";

export function App({ Component, pageProps }: AppProps) {
  const {
    _connectToMetaMask,
    _sendMessageToMetaMask,
    _disconnectFromMetaMask,
    accountData,
    provider,
    signer,
  } = useConnection();

  const {
    txnLoading,
    testProvider,
    getBalance,
    getReplyCount,
    getReply,
    getPost,
    getAllPosts,
    addPaycoins,
    withdrawPaycoins,
    createPost,
    createReply,
  } = useTransactions();

  const CombinedTransaction={
    txnLoading,
    testProvider,
    getBalance,
    getReplyCount,
    getReply,
    getPost,
    getAllPosts,
    addPaycoins,
    withdrawPaycoins,
    createPost,
    createReply,
  };

  const combinedData = {
    _connectToMetaMask,
    _disconnectFromMetaMask,
    _sendMessageToMetaMask,
    accountData,
    provider,
    signer,
  };
  return (
    <>
      <Component {...pageProps} connectionData={combinedData} connectionTransaction={CombinedTransaction} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default wrapper.withRedux(App);
