import React, { useState, useCallback, useRef } from "react";
import classnames from "classnames";

import ErrorBoundary from "src/components/widgets/base/ErrorBoundary";
import PromptInput from "src/components/ui/PromptInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PromptPicker from "./PromptPicker";
import { AIMessage, HumanMessage } from "src/components/domains/ai";

export default function Chat({
  project,
  subContext,
  examplePrompts,
  placeholder,
}) {
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
      const data = await response.json();
      setError(
        data.message || "Sorry, something went wrong. Please try again."
      );
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

  placeholder =
    placeholder ||
    "Hello! I am a friendly AI that can answer questions about conversations in your Panoramica project.";

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="overflow-y-scroll grow pb-8 h-full">
          {messages.map((message, index) => {
            const isAi = index % 2 === 1;
            if (isAi) {
              return <AIMessage key={index}>{message}</AIMessage>;
            } else {
              return <HumanMessage key={index}>{message}</HumanMessage>;
            }
          })}
          <div ref={messageRef} />
        </div>
        <div className="flex relative flex-col pt-2 px-4 pb-6">
          {messages.length > 0 && (
            <div className="-mt-8 absolute right-5 z-20">
              <button
                className="text-tertiary text-xs hover:underline"
                onClick={reset}
              >
                <FontAwesomeIcon className="mr-1" icon="arrows-rotate" />
                <span>reset</span>
              </button>
            </div>
          )}
          {!error && messages.length === 0 && (
            <div className="text-tertiary my-4 font-light">
              <AIMessage>
                {placeholder}
                {examplePrompts?.length > 0 && (
                  <div className="flex flex-1 items-end my-4">
                    <PromptPicker
                      prompts={examplePrompts}
                      pickPrompt={pickPrompt}
                    />
                  </div>
                )}
              </AIMessage>
            </div>
          )}

          {error && <div className="py-4 text-red-500">{error}</div>}

          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            fetchPrompt={fetchPrompt}
            disabled={loading || streaming}
            loading={loading}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
