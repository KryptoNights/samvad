import React, { useState, useEffect } from "react";
import { debounce } from "../../src/utils/utils";
import Comment from "../Comment/Comment";
import useConnection from "@/utils/connection";
import useTransactions from "@/utils/useTransactions";
import { Avatar } from "@mui/material";
import { Button } from "@cred/neopop-web/lib/components";
import { InputField } from "@cred/neopop-web/lib/components";
import styles from "./comments.module.css";
import { Typography } from "@cred/neopop-web/lib/components";
import { colorPalette, FontVariant } from "@cred/neopop-web/lib/primitives";
import { showWarningToast } from "@/utils/notifications";

const githubUserIds = [
  23977234, 31523966, 3518527, 27022981, 68613247, 89782151, 72006591, 46043928,
  46043428, 68611224, 89734451,
];

export default function Comments({
  replies,
  postId,
}: {
  replies: any;
  postId: number;
}) {
  const { signer } = useConnection();
  const { createReply } = useTransactions();
  console.log("replies", replies);

  const [commentInput, setCommentInput] = useState("");
  const [randomImages, setRandomImages] = useState<string[]>([]);

  useEffect(() => {
    const generateRandomImages = () => {
      const images = replies?.map(() => {
        const randomUserId =
          githubUserIds[Math.floor(Math.random() * githubUserIds.length)];
        return `https://avatars.githubusercontent.com/u/${randomUserId}`;
      });
      setRandomImages(images || []);
    };

    generateRandomImages();
  }, [replies]);

  const onSubmit = async () => {
    try {
      await createReply(
        postId,
        postId,
        commentInput,
        true,
        "10000000000000000",
        signer!
      );
    } catch (error) {
      console.log("failed");
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ width: "100%" }}>
        <br />
        <Typography
          {...FontVariant.HeadingSemiBold22}
          color={colorPalette.popWhite[500]}
          style={{ fontSize: "18px" }}
        >
          Add Your Comment
        </Typography>
        <InputField
          autoFocus
          colorConfig={{
            labelColor: "#FFFFFF",
            textColor: "#FFFFFF",
          }}
          colorMode="light"
          value={commentInput}
          inputMode="text"
          placeholder="Reply to Post"
          onChange={(e: any) => {
            setCommentInput(e.target.value);
          }}
          type="text"
          textStyle={styles.label}
          style={{
            marginTop: "12px",
            marginBottom: "20px",
            paddingBottom: "6px",
            borderBottom: "2px solid #8A8A8A",
          }}
        />
        <Button
          colorMode="light"
          kind="elevated"
          size="Big"
          style={{
            color: colorPalette.popWhite[500],
            marginRight: "12px",
            marginBottom: "12px",
          }}
          onClick={() => {
            setCommentInput("");
            commentInput.length > 0 ? onSubmit() : showWarningToast("No text added");
          }}
        >
          Submit
        </Button>
      </div>
      <div style={{ color: "white", width: "100%" }}>
        {replies?.map((reply: any) => (
          <Comment key={reply.id} reply={reply} postId={postId} />
        ))}
      </div>
    </div>
  );
}
