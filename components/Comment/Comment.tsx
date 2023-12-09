import React, { useState, useRef } from "react";

export default function Comment({ reply }: { reply: any;}) {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const inputEl: any = useRef(null);

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
                // This is to make the ref available
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
            ref={inputEl}
            className="w-full border border-gray-300 rounded p-2"
            onChange={(e) => {
              setReplyText(e.target.value);
            }}
          />
          <div className="flex mt-2">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer mr-2"
              onClick={() => {
                // addReply(comment.id, replyText);
                setShowReplyBox(false);
                setReplyText("");
              }}
            >
              Reply
            </button>
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
            <Comment key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
