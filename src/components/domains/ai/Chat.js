import React, { useState, useCallback, useRef } from "react";

import ErrorBoundary from "src/components/widgets/base/ErrorBoundary";
import PromptInput from "src/components/ui/PromptInput";
import Loader from "src/components/domains/ui/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PromptPicker from "./PromptPicker";

export default function Chat({ project, subContext, examplePrompts }) {
  var messageRef = useRef();

  let [prompt, setPrompt] = useState("");
  let [streaming, setStreaming] = useState(false);
  let [messages, setMessages] = useState([]);
  let [error, setError] = useState("");

  // An odd length means we're waiting for the AI to start streaming an answer
  let loading = messages.length % 2 === 1;

  const popMessage = () => {
    setMessages((messages) => messages.slice(0, -1));
  };

  const reset = () => {
    setStreaming(false);
    setError("");
    setMessages([]);
  };

  const appendMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  };

  const streamToMessages = (text) => {
    setMessages((messages) => {
      const lastMessage = messages.pop();

      return [...messages, lastMessage + text];
    });
  };

  const pickPrompt = useCallback(
    (prompt) => {
      setPrompt(prompt);
    },
    [setPrompt]
  );

  const fetchPrompt = async (e) => {
    e.preventDefault();
    if (prompt === "") return;

    messageRef.current.scrollIntoView({});

    // Append the prompt into the messages and clear it from the input
    appendMessage(prompt);
    setPrompt("");
    setError("");

    const payload = { subContext, chat: [...messages, prompt] };

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
      streamToMessages(text);
      messageRef.current.scrollIntoView({});
    }

    setStreaming(false);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col px-6 h-full">
        <div className="flex overflow-y-scroll flex-col flex-1 grow mt-4">
          {!error && !examplePrompts && messages.length === 0 && (
            <div className="text-tertiary font-light">
              Hello, I am a friendly AI that can answer questions about
              conversations in your Panoramica project.
            </div>
          )}

          {messages.map((message, index) => {
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
            <div className="my-4 mx-auto">
              <Loader />
            </div>
          )}

          {error && <div className="text-red-500">{error}</div>}

          <div ref={messageRef} />

          {messages.length === 0 && examplePrompts && (
            <div className="px-6 mt-4">
              <PromptPicker prompts={examplePrompts} pickPrompt={pickPrompt} />
            </div>
          )}
        </div>
        <div className="flex flex-col pt-2 pb-6">
          <div className="my-2 ml-auto">
            <button className="text-tertiary hover:underline" onClick={reset}>
              <FontAwesomeIcon className="mr-1" icon="arrows-rotate" />
              Reset
            </button>
          </div>
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            fetchPrompt={fetchPrompt}
            disabled={loading || streaming}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
