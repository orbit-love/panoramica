import React, { useState, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Frame } from "src/components/widgets";
import PromptInput from "src/components/ui/PromptInput";

export default function Prompt({ project }) {
  var messageRef = useRef();

  let [prompt, setPrompt] = useState("");
  let [streaming, setStreaming] = useState(false);
  let [conversation, setConversation] = useState([]);
  let [error, setError] = useState("");

  // An odd length means we're waiting for the AI to start streaming an answer
  let loading = conversation.length % 2 === 1;

  const popMessage = () => {
    setConversation((conversation) => conversation.slice(0, -1));
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const appendMessage = (message) => {
    setConversation((conversation) => [...conversation, message]);
  };

  const streamToConversation = (text) => {
    setConversation((conversation) => {
      const lastMessage = conversation.pop();

      return [...conversation, lastMessage + text];
    });
  };

  const fetchPrompt = async (e) => {
    e.preventDefault();
    if (prompt === "") return;

    messageRef.current.scrollIntoView({});

    // Append the prompt into the conversation and clear it from the input
    appendMessage(prompt);
    setPrompt("");
    setError("");

    const payload = { chat: [...conversation, prompt] };

    var response = await fetch(`/api/projects/${project.id}/prompt`, {
      body: JSON.stringify(payload),
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      popMessage();
      setError("Sorry, something went wrong. Please try again.");
      return;
    }

    // Start appending an empty response
    appendMessage("");
    setStreaming(true);

    const reader = response.body.getReader();

    while (true) {
      const { value, done } = await reader.read();
      const text = new TextDecoder("utf-8").decode(value);
      if (done) break;
      // Progressively complete the last response
      streamToConversation(text);
      messageRef.current.scrollIntoView({});
    }

    setStreaming(false);
  };

  return (
    <Frame>
      <div className="flex flex-col px-4 h-full">
        <div className="flex flex-col flex-1 grow mt-4">
          {conversation.map((message, index) => {
            const isAi = index % 2 === 1;
            const classes = isAi ? "ml-8" : "";
            return (
              <div
                key={index}
                className={
                  classes +
                  " whitespace-pre-wrap my-2 p-4 bg-gray-100 dark:bg-gray-800"
                }
              >
                {message}
              </div>
            );
          })}

          {loading && (
            <div className="">
              <FontAwesomeIcon icon="circle-notch" spin />
            </div>
          )}

          {error && <div className="text-red-500">{error}</div>}

          <div ref={messageRef} />
        </div>
        <div className="py-4">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            fetchPrompt={fetchPrompt}
            disabled={loading || streaming}
          />
        </div>
      </div>
    </Frame>
  );
}
