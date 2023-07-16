import React, { useState, useCallback, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import { Frame, saveLayout } from "components/skydeck";
import Thread from "components/compact/thread";
import PromptInput from "components/promptInput";
import { conversationPrompts } from "lib/ai/prompts";
import { putActivityUpdate } from "components/skydeck/fetches";

export default function Conversation({
  project,
  community,
  api,
  containerApi,
  params,
  handlers,
}) {
  var messageRef = useRef();
  var { activity, fullscreen } = params;
  let [prompt, setPrompt] = useState("");
  let [lastMessage, setLastMessage] = useState("");
  let [lastSummary, setLastSummary] = useState(api.title);
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

  const updateTitle = useCallback(
    (lastSummary) => {
      api.setTitle(lastSummary);
      saveLayout({ project, containerApi });
    },
    [project, api, containerApi]
  );

  useEffect(() => {
    updateTitle(lastSummary);
  }, [lastSummary, updateTitle]);

  const defaultSummary = activity.text.slice(0, 50);

  const fetchSummary = useCallback(async () => {
    // try to summarize the conversation
    try {
      var response = await fetch(
        `/api/projects/${project.id}/${activity.id}/summary`
      );
      // clear it to start over
      setLastSummary("");
      const reader = response.body.getReader();
      // keep track of the response to see if it came back empty
      // if it did, it means the model failed somewhere and we should
      // set a default summary
      let allText = "";
      while (true) {
        const { value, done } = await reader.read();
        const text = new TextDecoder("utf-8").decode(value);
        if (done) break;
        allText += text;
        setLastSummary((prevText) => prevText + text);
      }
      if (allText.length === 0) {
        setLastSummary(defaultSummary);
      } else {
        activity.summary = allText;
      }
    } catch (e) {
      setLastSummary(defaultSummary);
    }
  }, [project, activity, setLastSummary, defaultSummary]);

  console.log(activity);
  useEffect(() => {
    if (!activity.summary) {
      if (project.modelName) {
        if (lastSummary === "...") {
          fetchSummary();
        }
      } else {
        setLastSummary(defaultSummary);
      }
    }
  }, []);

  const runPrompt = useCallback(
    (name) => {
      setPrompt(conversationPrompts[name]);
    },
    [setPrompt]
  );

  const resetPrompt = useCallback(() => {
    setPrompt("");
    setLastMessage(null);
  }, [setPrompt, setLastMessage]);

  return (
    <Frame>
      <div
        className={classnames("flex h-full", {
          "flex-row": fullscreen,
          "flex-col space-y-4": !fullscreen,
        })}
      >
        <div
          className={classnames("px-4 pt-4", {
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
            "bg-opacity-40 overflow-y-scroll w-1/2 bg-indigo-800": fullscreen,
            "w-full": !fullscreen,
          })}
        >
          {project.modelName && (
            <>
              <div className="flex overflow-y-scroll flex-col mb-4 space-y-1">
                {loading && (
                  <div className="text-indigo-600">
                    <FontAwesomeIcon icon="circle-notch" spin />
                  </div>
                )}
                <div className="text-indigo-200 whitespace-pre-wrap">
                  {lastMessage}
                </div>
                <div className="text-indigo-500">
                  {!lastMessage && !loading && (
                    <>
                      <div className="mb-1 font-semibold">
                        Load an example prompt:
                      </div>
                      <ul className="list-disc list-inside">
                        <li>
                          <button
                            className="hover:underline"
                            onClick={() => runPrompt("NextSteps")}
                          >
                            Determine the next steps
                          </button>
                        </li>
                        <li>
                          <button
                            className="hover:underline"
                            onClick={() => runPrompt("Entities")}
                          >
                            List the key topics discussed
                          </button>
                        </li>
                        <li>
                          <button
                            className="hover:underline"
                            onClick={() => runPrompt("Translate")}
                          >
                            Translate the conversation into French
                          </button>
                        </li>
                        <li>
                          <button
                            className="hover:underline"
                            onClick={() => runPrompt("Timing")}
                          >
                            Analyze the time between messages
                          </button>
                        </li>
                        <li>
                          <button
                            className="hover:underline"
                            onClick={() => runPrompt("Tabularize")}
                          >
                            Display the conversation as a table
                          </button>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
                <div ref={messageRef} />
                {lastMessage && !loading && (
                  <button
                    onClick={resetPrompt}
                    className="text-sm text-right text-indigo-700 hover:underline"
                  >
                    reset
                  </button>
                )}
              </div>
              {fullscreen && <div className="grow" />}
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                fetchPrompt={fetchPrompt}
                placeholder={"Ask questions about this conversation..."}
              />
            </>
          )}
          {!project.modelName && (
            <div className="text-yellow-300">
              LLM and vector store are not configured. Edit the project and add
              the necessary information to enable AI features.
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}
