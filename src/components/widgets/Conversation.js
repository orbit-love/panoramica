import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import { Frame, saveLayout } from "src/components/widgets";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import useResizeCallback from "src/hooks/useResizeCallback";
import { ChatArea, TitleBar, Property } from "./Conversation/index";

export default function Conversation({
  project,
  api,
  containerApi,
  params,
  handlers,
}) {
  const { conversation: paramsConversation } = params;
  const [flexCol, setFlexCol] = useState();
  const [conversation, setConversation] = useState(paramsConversation);
  const [title, setTitle] = useState(api.title);

  const flexContainerRef = useRef();
  const cutoffWidth = 650;
  useResizeCallback(flexContainerRef, cutoffWidth, (isBelowCutoffWidth) =>
    setFlexCol(isBelowCutoffWidth)
  );

  useEffect(() => {
    if (conversation) {
      api.setTitle(
        conversation.properties.find((property) => property.name === "title")
          ?.value || title
      );
      api.updateParameters({ conversation });
    }
    saveLayout({ project, containerApi });
  }, [api, containerApi, project, title, conversation]);

  return (
    <Frame fullWidth>
      <div
        ref={flexContainerRef}
        className={classnames("flex h-full", {
          "flex-col": flexCol,
          "flex-row": flexCol === false,
          "flex-col md:flex-row": flexCol === undefined,
        })}
      >
        <div
          className={classnames("pt-4 w-full max-w-xl", {
            "overflow-y-scroll": !flexCol,
          })}
        >
          <TitleBar
            project={project}
            conversation={conversation}
            title={title}
            setTitle={setTitle}
            setConversation={setConversation}
          />
          {conversation.properties?.length > 1 && (
            <div className="flex flex-col px-6 mt-4 text-sm">
              <Property
                name="type"
                displayName="Type"
                properties={conversation.properties}
              />
              <Property
                name="topics"
                displayName="Topics"
                properties={conversation.properties}
              />
              <Property
                name="statuses"
                displayName="Status"
                properties={conversation.properties}
              />
            </div>
          )}
          <React.Suspense fallback={<div />}>
            <FullThreadView conversation={conversation} handlers={handlers} />
          </React.Suspense>
        </div>
        {flexCol && <div className="grow" />}
        <div className="flex flex-col w-full border-l border-gray-300 dark:border-gray-800">
          <React.Suspense fallback={<div></div>}>
            <ChatArea project={project} conversation={conversation} />
          </React.Suspense>
        </div>
      </div>
    </Frame>
  );
}
