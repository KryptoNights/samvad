import React, { useEffect } from "react";
import styles from "./gloabl.module.css";
import { Header } from "../Header/Header";
interface LayoutProps {
  children: React.ReactNode;
  props: any;
}

const GlobalLayout: React.FC<LayoutProps> = ({ children, props }) => {
  const {
    accountData,
    provider,
    signer,
    _connectToMetaMask,
    _disconnectFromMetaMask,
  } = props.connectionData;

  return (
    <>
      <div className={styles.container} style={{ marginBottom: "80px" }}>
        <Header
          {...accountData}
          onConnect={_connectToMetaMask}
          onDisconnect={_disconnectFromMetaMask}
          props={props}
        />
        <div className={styles.subContainer}>{children}</div>
      </div>
    </>
  );
};

export default GlobalLayout;
