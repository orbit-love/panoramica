import React, { useState, useCallback, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Frame, Scroll, Header } from "components/skydeck";
import Thread from "components/compact/thread";
import PromptInput from "components/promptInput";

export default function Conversation(props) {
  var messageRef = useRef();
  var { project, community, activity } = props;
  let [prompt, setPrompt] = useState("");
  let [lastMessage, setLastMessage] = useState("");
  let [lastSummary, setLastSummary] = useState("");
  let [loading, setLoading] = useState(false);

  var thread = community.threads[activity.id];

  const fetchPrompt = useCallback(
    async (e) => {
      e.preventDefault();
      // clear the last result
      setLastMessage("");
      setLoading(true);
      messageRef.current.scrollIntoView({});
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
        messageRef.current.scrollIntoView({});
      }
    },
    [project, activity, setLastMessage, prompt]
  );

  const fetchSummary = useCallback(async () => {
    setLastSummary("...");
    var response = await fetch(
      `/api/projects/${project.id}/${activity.id}/summary`
    );
    setLastSummary("");
    console.log("FETCHED SUMMARY!");
    const reader = response.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      const text = new TextDecoder("utf-8").decode(value);
      if (done) break;
      setLastSummary((prevText) => prevText + text);
    }
  }, [project, activity, setLastSummary]);

  useEffect(() => {
    if (!lastSummary) {
      fetchSummary();
    }
  }, []);

  var title = lastSummary;

  return (
    <Frame>
      <Header {...props}>
        <div className="flex overflow-hidden items-center space-x-1">
          <FontAwesomeIcon icon="messages" />
          <div className="overflow-hidden text-sm text-ellipsis">{title}</div>
        </div>
      </Header>
      <div className="flex flex-col px-4 w-[450px] h-full overflow-hidden pb-4">
        <Scroll>
          <Thread thread={thread} {...props} onClickActivity={() => {}} />
          <div className="flex flex-col py-4 space-y-1">
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
            placeholder={"Please provide a summary of this conversation..."}
          />
        </div>
      </div>
    </Frame>
  );
}
