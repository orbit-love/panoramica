import React from "react";
import Loader from "src/components/domains/ui/Loader";

export default function Output({
  lastMessage,
  loading,
  resetPrompt,
  messageRef,
  children,
}) {
  return (
    <div className="flex overflow-y-scroll relative flex-col py-4 pl-4 pr-16 mb-4 bg-gray-100 rounded dark:bg-gray-800">
      {loading && <Loader />}
      {!loading && !lastMessage && (
        <div className="text-tertiary font-light">{children}</div>
      )}
      <div className="whitespace-pre-wrap">{lastMessage}</div>
      <div ref={messageRef} />
      {lastMessage && !loading && resetPrompt && (
        <button
          onClick={resetPrompt}
          className="text-tertiary inline absolute bottom-2 right-3 hover:underline"
        >
          reset
        </button>
      )}
    </div>
  );
}
