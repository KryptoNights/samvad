import React, { ChangeEvent, useEffect, useState } from "react";
import { AccountType } from "../layout/layout";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button } from "@cred/neopop-web/lib/components";
import CancelIcon from "@mui/icons-material/Cancel";
import { InputField } from "@cred/neopop-web/lib/components";
import useConnection from "@/utils/connection";
import { useRouter } from "next/router";
import styles from "./header.module.css";
import { Typography } from "@cred/neopop-web/lib/components";
import { colorPalette, FontVariant } from "@cred/neopop-web/lib/primitives";
import { CircularProgress } from "@mui/material";
import { create } from "ipfs-http-client";
import * as fs from "fs";
import useGasFees from "@/utils/getGasEstimation";

interface HeaderProps extends AccountType {
  onConnect: () => void;
  onDisconnect: () => void;
  props: any;
}

export const Header: React.FC<HeaderProps> = ({
  address,
  balance,
  chainId,
  network,
  onConnect,
  onDisconnect,
  props,
}: HeaderProps) => {
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
  } = props.connectionTransaction;

  const { signer, accountData } = useConnection();
  const [openModal, setOpenModal] = useState(false);
  const [payCoinOpenModal, setpayCoinOpenModal] = useState(false);
  const [withdrawCoinOpenModal, setwithDrawCoinOpenModal] = useState(false);
  const [url, setUrl] = useState("");
  const [mediaUrl, setmediaUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [paycoinValue, setPayCoinValue] = useState<any | null>(0);
  const [file, setFile] = useState<File>();

  const authToken = Buffer.from(
    `${process.env.NEXT_PUBLIC_API_KEY}:${process.env.NEXT_PUBLIC_API_SECRET}`
  ).toString("base64");
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: { Authorization: `Basic ${authToken}` },
  });

  const uploadImageToIPFS = async (file: any) => {
    console.log("clicked");
    try {
      const reader: any = new FileReader();
      reader.onloadend = async () => {
        const buffer = Buffer.from(reader.result);
        const fileAdded = await ipfs.add(buffer);
        console.log(
          "Image uploaded successfully with CID:",
          fileAdded.cid.toString()
        );

        setmediaUrl(`https://ipfs.io/ipfs/${fileAdded.cid.toString()}`);
        console.log(url);
        // Perform actions with the CID or the uploaded file
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading image to IPFS:", error);
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0]; // Assuming single file selection
    if (!file) return; // Handle case when no file is selected
    uploadImageToIPFS(file);
  };

  //Add post Modal
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleModalSubmit = async () => {
    console.log("URL:", url);
    console.log("media URL:", mediaUrl);
    console.log("Heading:", heading);
    console.log("Text:", text);

    try {
      await createPost(mediaUrl, url, text, heading, signer!);
      handleCloseModal();
      console.log("created");
    } catch (error) {
      console.error("Error creating post:", error);
      handleCloseModal();
    }
  };

  const handlewithDrawCoinOpenModal = () => {
    setwithDrawCoinOpenModal(true);
  };
  const handlewithDrawCoinCloseModal = () => {
    setwithDrawCoinOpenModal(false);
  };
  const handlewithDrawCoinModalSubmit = async () => {
    console.log("Amount:", amount);
    try {
      await withdrawPaycoins(amount, signer!);
      console.log("created");
      handlewithDrawCoinCloseModal();
    } catch (error) {
      console.error("Error withdrawing amount:", error);
      handlewithDrawCoinCloseModal();
    }
  };
  // Paycoin Modal
  const handlePayCoinOpenModal = () => {
    setpayCoinOpenModal(true);
  };
  const handlePayCoinCloseModal = () => {
    setpayCoinOpenModal(false);
  };
  const handlePayCoinModalSubmit = async () => {
    console.log("Amount:", amount);
    try {
      await addPaycoins(amount, signer!);
      console.log("created");
      handlePayCoinCloseModal();
    } catch (error) {
      console.error("Error adding amount:", error);
      handlePayCoinCloseModal();
    }
  };

  React.useEffect(() => {
    const getBalanceinHeader = async () => {
      try {
        const address = accountData.address!;
        const tx = await getBalance(address);
        console.log(tx);
        setPayCoinValue(tx);
        console.log(tx);
      } catch (error) {
        console.log(error);
      }
    };

    getBalanceinHeader();

    const intervalId = setInterval(() => {
      getBalanceinHeader();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [accountData]);

  const router = useRouter();
  function redirectToHome() {
    router.push("/");
  }

  const gasFees: any = useGasFees();
  console.log("gas", gasFees);

  return (
    <>
      <div className={styles.container}>
        <Typography
          {...FontVariant.HeadingBold20}
          color={colorPalette.popWhite[800]}
          onClick={redirectToHome}
          style={{ fontSize: "36px",cursor:'pointer' }}
        >
          SAMVAD
        </Typography>
        <div style={{ display: "flex" }}>
          <Button
            colorMode="light"
            kind="elevated"
            size="big"
            style={{ marginRight: "12px" }}
            onClick={() => {
              handlePayCoinOpenModal();
            }}
          >
            Funds : {Number(paycoinValue / 1e18).toFixed(2)}
          </Button>
          <Button
            colorMode="light"
            kind="elevated"
            size="big"
            style={{ marginRight: "12px" }}
            onClick={handleOpenModal}
          >
            Add Post
          </Button>

          {address ? (
            <>
              <Button
                colorMode="light"
                kind="elevated"
                size="big"
                onClick={onDisconnect}
              >
                🟢{" "}
                {address && address.length > 8
                  ? `${address.slice(0, 4)}...${address.slice(-4)}`
                  : address}
              </Button>
            </>
          ) : (
            <>
              <Button
                colorMode="light"
                kind="elevated"
                size="big"
                onClick={onConnect}
              >
                Connect
              </Button>
            </>
          )}
        </div>
        <Modal open={payCoinOpenModal} onClose={handlePayCoinCloseModal}>
          <Box
            sx={{
              width: "600px",
              p: 4,
              mx: "auto",
              my: "10%",
              backgroundColor: "#EFEFEF",
              borderRadius: "1px solid #8A8A8A",
              outline: "none",
              position: "relative",
            }}
          >
            <Typography
              {...FontVariant.HeadingSemiBold22}
              color={colorPalette.popBlack[500]}
              style={{ fontSize: "18px" }}
            >
              Amount
            </Typography>
            <InputField
              colorConfig={{
                labelColor: "#0d0d0d",
                textColor: "#000000",
              }}
              colorMode="light"
              id="text_field"
              value={amount}
              inputMode="text"
              maxLength={30}
              onChange={(e: any) => {
                setAmount(e.target.value);
              }}
              placeholder="enter amount to deposit"
              type="number"
              textStyle={styles.label}
              style={{
                marginTop: "12px",
                marginBottom: "34px",
                paddingBottom: "6px",
                borderBottom: "2px solid #8A8A8A",
              }}
            />

            <div style={{ display: "flex", flexDirection: "row" }}>
              <Typography
                {...FontVariant.HeadingNormal12}
                color={colorPalette.popBlack[500]}
                style={{ fontSize: "14px" }}
              >
                Estimated Gas Fees :
              </Typography>{" "}
              <Typography
                {...FontVariant.HeadingNormal12}
                color={colorPalette.popBlack[500]}
                style={{ fontSize: "14px" }}
              >
                {Number((gasFees?.estimatedBaseFee * 80000) / 1e9).toFixed(4)}{' '}eth
              </Typography>
            </div>
            <CancelIcon
              onClick={handlePayCoinCloseModal}
              className="absolute top-2 right-2 cursor-pointer"
            />

            <Button
              colorMode="dark"
              kind="elevated"
              size="big"
              style={{ marginTop: "32px" }}
              onClick={handlePayCoinModalSubmit}
            >
              {txnLoading ? (
                <div className={styles.flex}>
                  Transaction in Progress{" "}
                  <CircularProgress size={20} sx={{ color: "#FBFBFB" }} />
                </div>
              ) : (
                "Deposit Amount"
              )}
            </Button>
            <Button
              colorMode="dark"
              kind="elevated"
              size="big"
              style={{ marginTop: "32px", marginLeft: "12px" }}
              onClick={handlewithDrawCoinModalSubmit}
            >
              {txnLoading ? (
                <div className={styles.flex}>
                  Transaction in Progress{" "}
                  <CircularProgress size={20} sx={{ color: "#FBFBFB" }} />
                </div>
              ) : (
                "Withdraw Amount"
              )}
            </Button>
          </Box>
        </Modal>
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              width: "1000px",
              p: 5,
              mx: "auto",
              my: "10%",
              backgroundColor: "#EFEFEF",
              borderRadius: "1px solid #8A8A8A",
              outline: "none",
              position: "relative",
            }}
          >
            <CancelIcon
              onClick={handleCloseModal}
              className="absolute top-2 right-2 cursor-pointer"
            />
            <Typography
              {...FontVariant.HeadingSemiBold22}
              color={colorPalette.popBlack[500]}
              style={{ fontSize: "18px" }}
            >
              Upload Image
            </Typography>
            <InputField
              colorConfig={{
                labelColor: "#0d0d0d",
                textColor: "#000000",
              }}
              colorMode="light"
              fullWidth
              onChange={handleFileChange}
              placeholder="Upload Image  "
              type="file"
              style={{
                marginTop: "12px",
                marginBottom: "34px",
                paddingBottom: "6px",
                borderBottom: "2px solid #8A8A8A",
              }}
            />

            <Typography
              {...FontVariant.HeadingSemiBold22}
              color={colorPalette.popBlack[500]}
              style={{ fontSize: "18px" }}
            >
              Heading
            </Typography>
            <InputField
              colorConfig={{
                labelColor: "#0d0d0d",
                textColor: "#000000",
              }}
              colorMode="light"
              value={heading}
              maxLength={60}
              onChange={(e: any) => setHeading(e.target.value)}
              placeholder="Enter Heading of Post"
              type="text"
              style={{
                marginTop: "12px",
                marginBottom: "34px",
                paddingBottom: "6px",
                borderBottom: "2px solid #8A8A8A",
              }}
            />
            <Typography
              {...FontVariant.HeadingSemiBold22}
              color={colorPalette.popBlack[500]}
              style={{ fontSize: "18px" }}
            >
              Website
            </Typography>
            <InputField
              colorConfig={{
                labelColor: "#0d0d0d",
                textColor: "#000000",
              }}
              colorMode="light"
              value={url}
              maxLength={60}
              onChange={(e: any) => setUrl(e.target.value)}
              placeholder="Enter Website Url"
              type="text"
              style={{
                marginTop: "12px",
                marginBottom: "34px",
                paddingBottom: "6px",
                borderBottom: "2px solid #8A8A8A",
              }}
            />
            <Typography
              {...FontVariant.HeadingSemiBold22}
              color={colorPalette.popBlack[500]}
              style={{ fontSize: "18px" }}
            >
              Content
            </Typography>
            <InputField
              colorConfig={{
                labelColor: "#0d0d0d",
                textColor: "#000000",
              }}
              colorMode="light"
              value={text}
              onChange={(e: any) => setText(e.target.value)}
              placeholder="Enter Content of Post"
              type="text"
              style={{
                marginTop: "12px",
                marginBottom: "34px",
                paddingBottom: "6px",
                borderBottom: "2px solid #8A8A8A",
              }}
            />

            <div style={{ display: "flex", flexDirection: "row" }}>
              <Typography
                {...FontVariant.HeadingNormal12}
                color={colorPalette.popBlack[500]}
                style={{ fontSize: "14px" }}
              >
                Estimated Gas Fees :
              </Typography>{" "}
              <Typography
                {...FontVariant.HeadingNormal12}
                color={colorPalette.popBlack[500]}
                style={{ fontSize: "14px" }}
              >
                {Number((gasFees?.estimatedBaseFee * 500000) / 1e9).toFixed(4)}{' '}eth
              </Typography>
            </div>
            <Button
              colorMode="dark"
              kind="elevated"
              size="big"
              style={{ marginTop: "32px" }}
              onClick={handleModalSubmit}
            >
              {txnLoading ? (
                <div className={styles.flex}>
                  Transaction in Progress{" "}
                  <CircularProgress size={20} sx={{ color: "#FBFBFB" }} />
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </Modal>
      </div>
    </>
  );
};
