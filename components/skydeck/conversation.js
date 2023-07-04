import React, { useState, useCallback } from "react";

import { Frame, Scroll, Header } from "components/skydeck";
import Thread from "components/compact/thread";
import PromptInput from "components/promptInput";

export default function Conversation(props) {
  var { project, community, activity } = props;
  let [prompt, setPrompt] = useState("");
  let [lastMessage, setLastMessage] = useState("");
  let [loading, setLoading] = useState(false);

  var thread = community.threads[activity.id];

  const fetchPrompt = useCallback(
    async (e) => {
      e.preventDefault();
      // clear the last result
      setLastMessage("");
      setLoading(true);
      var params = new URLSearchParams({ q: prompt });
      var response = await fetch(
        `/api/projects/${project.id}/${activity.id}/prompt?${params}`
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
    [project, activity, setLastMessage, prompt]
  );

  var title = "";

  return (
    <Frame>
      <Header {...props}>
        <div>{title}</div>
      </Header>
      <div className="flex flex-col px-4 w-[425px] h-full overflow-hidden pb-4">
        <Scroll>
          <Thread
            nesting={0}
            thread={thread}
            topThread={thread}
            {...props}
            onClickConversation={() => {}}
          />
          <div className="flex flex-col py-4 space-y-1">
            {loading && <div className="text-indigo-600">Loading...</div>}
            <div className="text-sm text-violet-500 whitespace-pre-wrap">
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
            placeholder={"Ask a question about this conversation..."}
          />
        </div>
      </div>
    </Frame>
  );
}
