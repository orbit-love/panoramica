import React, { useState, useCallback, useRef } from "react";

import ErrorBoundary from "src/components/widgets/base/ErrorBoundary";
import PromptInput from "src/components/ui/PromptInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PromptPicker from "./PromptPicker";
import { AIMessage, HumanMessage } from "src/components/domains/ai";
import FunctionOutput from "./FunctionOutput";
import md from "src/markdown";

export default function Chat({
  project,
  subContext,
  examplePrompts,
  placeholder,
}) {
  var messageRef = useRef();

  let [prompt, setPrompt] = useState("");
  let [streaming, setStreaming] = useState(false);
  let [history, setHistory] = useState([]);
  let [error, setError] = useState("");
  let [functionOutput, setFunctionOutput] = useState();

  const appendMessageToHistory = ({ isAi, message }) => {
    setHistory((history) => {
      return [
        ...history,
        {
          isAi,
          processedMessage: md.render(message),
          rawMessage: message,
        },
      ];
    });
  };

  const streamToHistory = (text) => {
    setHistory((history) => {
      const lastMessageObject = history.pop();
      const rawMessage = lastMessageObject.rawMessage + text;
      return [
        ...history,
        {
          ...lastMessageObject,
          rawMessage,
          processedMessage: md.render(rawMessage),
        },
      ];
    });
  };

  const rawMessages = () =>
    history.map((messageObject) => messageObject.rawMessage);

  const popHistory = () => {
    setHistory((history) => history.slice(0, -1));
  };

  // An odd length means we're waiting for the AI to start streaming an answer
  let loading = history.length % 2 === 1;

  const reset = () => {
    setFunctionOutput(undefined);
    setStreaming(false);
    setError("");
    setHistory([]);
  };

  const pickPrompt = useCallback(
    (prompt) => {
      setPrompt(prompt);
    },
    [setPrompt]
  );

  const cancelPromptWithMessage = (message) => {
    popHistory();
    setError(message || "Sorry, something went wrong. Please try again.");
  };

  const streamAssistantAnswer = async (previousFunctionOutput) => {
    const payload = {
      subContext,
      chat: [...rawMessages(), prompt],
      previousFunctionOutput,
    };

    var response = await fetch(`/api/projects/${project.id}/assistant/stream`, {
      body: JSON.stringify(payload),
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        cancelPromptWithMessage(data.message);
      } catch (err) {
        console.log(err);
        cancelPromptWithMessage();
      }
      return;
    }

    // Start appending an empty response
    appendMessageToHistory({ isAi: true, message: "" });
    setStreaming(true);

    const reader = response.body.getReader();

    while (true) {
      const { value, done } = await reader.read();
      const text = new TextDecoder("utf-8").decode(value);
      if (done) break;
      // Progressively complete the last response
      streamToHistory(text);
      messageRef.current?.scrollIntoView({});
    }

    setStreaming(false);
  };

  const callFunction = async (e) => {
    e.preventDefault();

    if (prompt === "") return;

    messageRef.current?.scrollIntoView({});

    // Append the prompt into the messages and clear it from the input
    appendMessageToHistory({ isAi: false, message: prompt });
    setPrompt("");
    setError("");
    setFunctionOutput(undefined);

    const payload = { subContext, chat: [...rawMessages(), prompt] };
    const response = await fetch(
      `/api/projects/${project.id}/assistant/function`,
      {
        body: JSON.stringify(payload),
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    try {
      const data = await response.json();
      if (!response.ok) {
        return cancelPromptWithMessage(data.message);
      }

      const result = data.result;
      if (result.name === "answer") {
        return appendMessageToHistory({ isAi: true, message: result.output });
      }

      setFunctionOutput(result);
      streamAssistantAnswer(result);
    } catch (err) {
      console.log(err);
      cancelPromptWithMessage();
    }
  };

  placeholder =
    placeholder ||
    "Hello! I am a friendly AI that can answer questions about conversations in your Panoramica project.";

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="overflow-y-scroll grow pb-8 h-full">
          {history.map((messageObject, index) =>
            messageObject.isAi ? (
              <AIMessage key={index} message={messageObject.processedMessage} />
            ) : (
              <HumanMessage
                key={index}
                message={messageObject.processedMessage}
              />
            )
          )}
          <div ref={messageRef} />
        </div>
        <div className="flex relative flex-col pt-2 px-4 pb-6">
          {history.length > 0 && (
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
          {!error && history.length === 0 && (
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
          {/* {functionOutput && (
            <FunctionOutput project={project} functionOutput={functionOutput} />
          )} */}
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            callFunction={callFunction}
            disabled={loading || streaming}
            loading={loading}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
