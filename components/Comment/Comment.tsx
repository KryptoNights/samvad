import useConnection from "@/utils/connection";
import useTransactions from "@/utils/useTransactions";
import React, { useState, useRef } from "react";
import { Button } from "@cred/neopop-web/lib/components";
import { InputField } from "@cred/neopop-web/lib/components";



export default function Comment({
  reply,
  postId,
}: {
  reply: any;
  postId: number;
}) {
  const { signer } = useConnection();
  const { createReply } = useTransactions();

  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const inputEl: any = useRef(null);
  console.log("this is reply", reply);

  const onSubmit = async () => {
    try {
      await createReply(
        postId,
        1,
        replyText,
        false,
        "10000000000000000",
        signer!
      );
    } catch (error) {
      console.log("failed");
      console.log(error);
    }
  };

  return (
    <div key={reply.id} className="border border-gray-300 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
        </div>
        <div className="ml-4">
          <p className="font-bold">{reply.text}</p>
          {!showReplyBox && (
            <button
              type="button"
              className="text-gray-500 hover:text-blue-500"
              onClick={() => {
                setShowReplyBox(true);
                setTimeout(() => inputEl.current.focus());
              }}
            >
              Reply
            </button>
          )}
        </div>
      </div>
      {showReplyBox && (
        <div className="mt-4">
          <textarea
            id={reply.id}
            ref={inputEl}
            className="border border-gray-300 rounded p-2"
            onChange={(e) => {
              setReplyText(e.target.value);
            }}
          />
          {/* <InputField
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
            onChange={(e:any) => {
              setReplyText(e.target.value);
            }}
            type="text"
            style={{ marginTop: "12px", marginBottom: "20px", paddingBottom: '6px', borderBottom: '2px solid #8A8A8A' }}
          /> */}
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
