import useConnection from "@/utils/connection";
import useTransactions from "@/utils/useTransactions";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@cred/neopop-web/lib/components";
import { InputField } from "@cred/neopop-web/lib/components";
import styles from "./comment.module.css";
import { Avatar } from "@mui/material";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { showInfoToast } from "@/utils/notifications";

export default function Comment({
  reply,
  postId,
}: {
  reply: any;
  postId: number;
}) {
  const githubUserIds = [
    23977234, 31523966, 3518527, 27022981, 68613247, 89782151, 72006591,
    46043928, 46043428, 68611224, 89734451,
  ];

  const [randomImage, setRandomImage] = useState<string>("");

  useEffect(() => {
    const randomUserId =
      githubUserIds[Math.floor(Math.random() * githubUserIds.length)];
    const avatarUrl = `https://avatars.githubusercontent.com/u/${randomUserId}`;
    setRandomImage(avatarUrl);
  }, []);

  const { signer } = useConnection();
  const { createReply } = useTransactions();

  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [NotificationData, setNotificationData] = useState("");
  const [userAlice, setUserAlice] = useState<PushAPI | null>(null);

  const inputEl: any = useRef(null);
  console.log("this is reply", reply);

  const onSubmit = async () => {
    try {
      await createReply(
        postId,
        reply.id,
        replyText,
        false,
        "10000000000000000",
        signer!
      );
      sendNotification();
    } catch (error) {
      console.log("failed");
      console.log(error);
    }
  };

  useEffect(() => {
    const initializePushAPI = async () => {
      try {
        const user = await PushAPI.initialize(signer, {
          env: "staging",
        });
        setUserAlice(user);
        const stream: any = await userAlice?.initStream(
          [CONSTANTS.STREAM.NOTIF],
          {
            filter: {
              channels: ["*"], // pass in specific channels to only listen to those
              chats: ["*"], // pass in specific chat ids to only listen to those
            },
            connection: {
              retries: 3, // number of retries in case of error
            },
            raw: true, // enable true to show all data
          }
        );

        stream.on(CONSTANTS.STREAM.NOTIF, (data: any) => {
          console.log(data.message.notification.body);
          // setNotificationData(data.message.notification.body);
          // showInfoToast(data.message.notification.body);
        });

        stream.connect();

        console.log("user alice", userAlice);
      } catch (error) {
        console.error("Error initializing PushAPI:", error);
      }
    };
    initializePushAPI();
  }, [postId]);

  const sendNotification = async () => {
    await userAlice?.channel.send(["*"], {
      notification: {
        title: "New Notification for you",
        body: "Someone replied to your message",
      },
    });
    showInfoToast(NotificationData);
  };

  return (
    <div key={reply.id} className={styles.container}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Avatar
            alt="Avatar"
            src={randomImage}
            sx={{ height: "40px", width: "auto", borderRadius: "50%" }}
          />
        </div>
        <div className="ml-4">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <p className="font-bold">{reply.text}</p>
            <div className={styles.aa}>{`(By : ${reply.address.slice(
              0,
              4
            )}...${reply.address.slice(-4)})`}</div>
          </div>
          {!showReplyBox && (
            <button
              type="button"
              className="text-white-500 hover:text-blue-500"
              onClick={() => {
                setShowReplyBox(true);
              }}
            >
              Reply
            </button>
          )}
        </div>
      </div>
      {showReplyBox && (
        <div className="mt-4">
          <InputField
            autoFocus
            colorConfig={{
              labelColor: "#FFFFFF",
              textColor: "#FFFFFF",
            }}
            colorMode="light"
            id={reply.id}
            ref={inputEl}
            className="border border-gray-300 rounded p-2"
            inputMode="text"
            onChange={(e: any) => {
              setReplyText(e.target.value);
            }}
            type="text"
            style={{
              marginTop: "12px",
              marginBottom: "20px",
              paddingBottom: "6px",
              borderBottom: "2px solid #8A8A8A",
            }}
          />
          <div className="flex mt-2">
            <Button
              type="button"
              colorMode="light"
              kind="elevated"
              size="big"
              style={{ marginRight: "12px" }}
              onClick={() => {
                // addReply(comment.id, replyText);
                setShowReplyBox(false);
                setReplyText("");
                onSubmit();
              }}
            >
              Reply
            </Button>
            <button
              type="button"
              className="text-gray-500 hover:text-blue-500"
              onClick={() => {
                setShowReplyBox(false);
                setReplyText("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {reply?.replies?.length > 0 && (
        <div className="mt-4 pl-8">
          {reply.replies.map((reply: any) => (
            <Comment key={reply.id} reply={reply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
