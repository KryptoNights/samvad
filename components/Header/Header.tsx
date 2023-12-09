import React, { useEffect, useState } from "react";
import { AccountType } from "../layout/layout";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CancelIcon from "@mui/icons-material/Cancel";
import useConnection from "@/utils/connection";
import { createPost } from "@/utils/transition";

interface HeaderProps extends AccountType {
  onConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  address,
  balance,
  chainId,
  network,
  onConnect,
}: HeaderProps) => {
  const { signer } = useConnection();
  const [openModal, setOpenModal] = useState(false);
  const [url, setUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [text, setText] = useState("");

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleModalSubmit = async () => {
    console.log("URL:", url);
    console.log("Heading:", heading);
    console.log("Text:", text);
    handleCloseModal();

    try {
      await createPost(url, text, heading, signer!, "sepolio");
      console.log("created");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <>
      <div className="bg-gray-800 text-white p-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-3xl font-bold mb-4 md:mb-0">SAMVAD</div>
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="flex items-center">
            🟢 <span className="ml-1">{address ?? "Wallet Address"}</span>
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="inline-block ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="ml-1">{balance ?? "Balance"}</span>
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="inline-block ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span className="ml-1">{chainId ?? "Chain ID"}</span>
          </div>
          <div className="flex items-center">
            <svg
              width={24}
              height={24}
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block ml-2"
            >
              <path d="M1024.26 141.82c0-77.04-62.46-139.5-139.5-139.5s-139.5 62.46-139.5 139.5c0 52.26 28.74 97.8 71.27 121.69l-55.6 246.87c-1.38-0.04-2.77-0.07-4.17-0.07-38.52 0-73.39 15.61-98.63 40.85l-254.64-147a140.05 140.05 0 0 0 3.78-32.34c0-77.04-62.46-139.5-139.5-139.5s-139.5 62.46-139.5 139.5c0 51.45 27.86 96.39 69.32 120.58l-56.9 252.62c-0.4 0-0.79-0.01-1.18-0.01C62.46 745 0 807.46 0 884.5S62.46 1024 139.5 1024 279 961.54 279 884.5c0-51.25-27.65-96.04-68.83-120.29l56.96-252.89c0.21 0 0.43 0.01 0.64 0.01 39.99 0 76.05-16.83 101.48-43.79L622.06 613.5a139.612 139.612 0 0 0-4.79 36.34c0 77.04 62.46 139.5 139.5 139.5s139.5-62.46 139.5-139.5c0-50.15-26.47-94.12-66.2-118.7l56.27-249.82c76.31-0.86 137.92-62.98 137.92-139.5z m-884.5 809.42c-37.19 0-67.42-30.25-67.42-67.42 0-37.19 30.23-67.42 67.42-67.42 37.17 0 67.42 30.23 67.42 67.42 0 37.17-30.25 67.42-67.42 67.42z m128.27-512.67c-37.19 0-67.42-30.25-67.42-67.42 0-37.19 30.23-67.42 67.42-67.42 37.17 0 67.42 30.23 67.42 67.42 0 37.17-30.25 67.42-67.42 67.42z m489 278c-37.19 0-67.42-30.25-67.42-67.42 0-37.19 30.23-67.42 67.42-67.42 37.17 0 67.42 30.23 67.42 67.42 0 37.17-30.25 67.42-67.42 67.42z m128-642.84c37.17 0 67.42 30.23 67.42 67.42 0 37.17-30.25 67.42-67.42 67.42-37.19 0-67.42-30.25-67.42-67.42 0-37.19 30.23-67.42 67.42-67.42z" />
            </svg>
            <span className="ml-1">{network ?? "Network"}</span>
          </div>
        </div>
        <div>
          <button
            onClick={handleOpenModal}
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Add Post
          </button>
          <button
            onClick={onConnect}
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer ml-4"
          >
            Connect
          </button>
        </div>
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              width: "90%",
              p: 4,
              mx: "auto",
              my: "10%",
              backgroundColor: "white",
              borderRadius: "md",
              outline: "none",
              boxShadow: "2xl",
              position: "relative",
            }}
          >
            <CancelIcon
              onClick={handleCloseModal}
              className="absolute top-2 right-2 cursor-pointer"
            />
            <TextField
              label="URL"
              variant="outlined"
              fullWidth
              margin="normal"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <TextField
              label="Heading"
              variant="outlined"
              fullWidth
              margin="normal"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />
            <TextField
              label="Text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalSubmit}
              className="mt-4"
            >
              Submit
            </Button>
          </Box>
        </Modal>
      </div>
    </>
  );
};
