import React, { useState, useCallback } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import PromptInput from "components/promptInput";

export default function Prompt(props) {
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
            {loading && <div className="text-indigo-600">Loading...</div>}
            <div className="text-indigo-200 whitespace-pre-wrap">
              {lastMessage}
            </div>
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
