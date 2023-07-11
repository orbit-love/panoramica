import React, { useState, useCallback, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import { Frame } from "components/skydeck";
import Thread from "components/compact/thread";
import PromptInput from "components/promptInput";

export default function Conversation({
  project,
  community,
  api,
  params,
  handlers,
}) {
  var messageRef = useRef();
  var { activity, fullscreen } = params;
  let [prompt, setPrompt] = useState("");
  let [lastMessage, setLastMessage] = useState("");
  let [lastSummary, setLastSummary] = useState("");
  let [loading, setLoading] = useState(false);

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

  useEffect(() => {
    api.setTitle(lastSummary);
  }, [api, lastSummary]);

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

  return (
    <Frame api={api}>
      <div
        className={classnames("flex h-full", {
          "flex-row": fullscreen,
          "flex-col space-y-4": !fullscreen,
        })}
      >
        <div
          className={classnames("px-4 py-4", {
            grow: !fullscreen,
            "overflow-y-scroll w-1/2": fullscreen,
          })}
        >
          <Thread
            activity={activity}
            community={community}
            handlers={handlers}
            onClickActivity={() => {}}
          />
        </div>
        <div
          className={classnames("flex flex-col p-4", {
            "bg-opacity-40 w-1/2 bg-indigo-800": fullscreen,
            "w-full": !fullscreen,
          })}
        >
          <div className="flex flex-col pb-4 space-y-1">
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
          {fullscreen && <div className="grow" />}
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            fetchPrompt={fetchPrompt}
            placeholder={"Ask questions about this conversation..."}
          />
        </div>
      </div>
    </Frame>
  );
}
