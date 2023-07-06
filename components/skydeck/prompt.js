import React, { useState, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Frame, Scroll, Header } from "components/skydeck";
import PromptInput from "components/promptInput";

export default function Prompt(props) {
  var messageRef = useRef();
  let { project } = props;
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
  return (
    <Frame>
      <Header {...props}>
        <div className="text-lg">Prompt</div>
      </Header>
      <div className="flex flex-col px-4 w-[425px] h-full pb-4 overflow-hidden">
        <Scroll>
          <div className="flex flex-col pb-8 space-y-1">
            {loading && (
              <div className="text-indigo-600">
                <FontAwesomeIcon icon="circle-notch" spin />
              </div>
            )}
            <div className="text-indigo-200 whitespace-pre-wrap">
              {lastMessage}
            </div>
            <div ref={messageRef} />
          </div>
        </Scroll>
        <div className="my-auto" />
        <div className="pt-4">
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
