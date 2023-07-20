import React, { useState, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Frame } from "src/components/widgets";
import PromptInput from "src/components/ui/PromptInput";
import Output from "../domains/ai/Output";
import Loader from "../domains/ui/Loader";

export default function Prompt({ project }) {
  var messageRef = useRef();
  let [prompt, setPrompt] = useState("");
  let [loading, setLoading] = useState(false);
  let [lastMessage, setLastMessage] = useState("");

  const fetchPrompt = useCallback(
    async (e) => {
      e.preventDefault();
      // clear the last result
      setLastMessage("");
      setLoading(true);
      messageRef.current.scrollIntoView({});
      var params = new URLSearchParams({ q: prompt });
      var response = await fetch(
        `/api/projects/${project.id}/prompt?${params}`
      );
      setLoading(false);
      const reader = response.body.getReader();
      while (true) {
        const { value, done } = await reader.read();
        const text = new TextDecoder("utf-8").decode(value);
        if (done) break;
        setLastMessage((prevText) => prevText + text);
        messageRef.current.scrollIntoView({});
      }
    },
    [project, setLastMessage, prompt]
  );

  const resetPrompt = useCallback(() => {
    setPrompt("");
    setLastMessage(null);
  }, [setPrompt, setLastMessage]);

  return (
    <Frame>
      <div className="flex flex-col p-4 h-full">
        <div className="flex-grow" />
        <Output
          lastMessage={lastMessage}
          loading={loading}
          resetPrompt={resetPrompt}
          messageRef={messageRef}
        >
          Hello, I am a friendly AI that can answer questions about your
          community.
        </Output>
        <div className="py-4">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            fetchPrompt={fetchPrompt}
          />
        </div>
      </div>
    </Frame>
  );
}
