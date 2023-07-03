import React, { useState, useCallback } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import c from "lib/common";

export default function Chat(props) {
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
      <Scroll>
        <div className="flex flex-col px-4 w-[450px]">
          <div className="mb-4 font-semibold text-center text-blue-500">
            <form onSubmit={fetchPrompt} className="flex flex-col space-y-3">
              <textarea
                className={c.inputClasses}
                value={prompt}
                rows={4}
                required
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex items-end">
                <button type="submit" className={c.buttonClasses}>
                  Submit
                </button>
              </div>
            </form>
          </div>
          <div className="flex flex-col pb-8 space-y-1">
            {loading && <div className="text-indigo-600">Loading...</div>}
            <div className="text-sm text-indigo-300 whitespace-pre-wrap">
              {lastMessage}
            </div>
          </div>
        </div>
      </Scroll>
    </Frame>
  );
}
