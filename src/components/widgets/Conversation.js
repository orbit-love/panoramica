import React, { useState, useCallback, useEffect, useRef } from "react";
import classnames from "classnames";

import { Frame, saveLayout } from "src/components/widgets";
import { conversationPrompts } from "src/configuration/prompts";
import Chat from "src/components/domains/ai/Chat";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import useResizeCallback from "src/hooks/useResizeCallback";

export default function Conversation({
  project,
  community,
  api,
  containerApi,
  params,
  handlers,
}) {
  var { activity } = params;
  let [lastSummary, setLastSummary] = useState(api.title);
  let [flexCol, setFlexCol] = useState();

  const flexContainerRef = useRef();
  const cutoffWidth = 650;
  useResizeCallback(flexContainerRef, cutoffWidth, (isBelowCutoffWidth) =>
    setFlexCol(isBelowCutoffWidth)
  );

  const subContext = { conversationId: activity.id };

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

  return (
    <Frame>
      <div
        ref={flexContainerRef}
        className={classnames("flex h-full", {
          "flex-col": flexCol,
          "flex-row": flexCol === false,
          "flex-col md:flex-row": flexCol === undefined,
        })}
      >
        <div className="pt-4 px-6 w-full md:overflow-y-scroll">
          <FullThreadView
            activity={activity}
            community={community}
            handlers={handlers}
          />
        </div>
        {flexCol && <div className="grow" />}
        <div className="flex flex-col w-full border-l border-gray-200 md:overflow-y-scroll dark:border-gray-800">
          {project.modelName && (
            <Chat
              project={project}
              subContext={subContext}
              examplePrompts={conversationPrompts}
            />
          )}
          {!project.modelName && (
            <div className="p-6 text-red-500">
              LLM and vector stores are not configured. Edit the project and add
              the necessary information to enable AI features.
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}
