import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import { Frame, saveLayout } from "src/components/widgets";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import useResizeCallback from "src/hooks/useResizeCallback";
import { ChatArea, TitleBar } from "./Conversation/index";

export default function Conversation({
  project,
  api,
  containerApi,
  params,
  handlers,
}) {
  var { activity: paramsActivity } = params;
  let [flexCol, setFlexCol] = useState();
  const [activity, setActivity] = useState(paramsActivity);
  const [title, setTitle] = useState(api.title);

  const flexContainerRef = useRef();
  const cutoffWidth = 650;
  useResizeCallback(flexContainerRef, cutoffWidth, (isBelowCutoffWidth) =>
    setFlexCol(isBelowCutoffWidth)
  );

  useEffect(() => {
    if (title) {
      api.setTitle(title);
    }
    if (activity) {
      api.updateParameters({ activity });
    }
    saveLayout({ project, containerApi });
  }, [api, containerApi, project, title, activity]);

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
            activity={activity}
            title={title}
            setTitle={setTitle}
            setActivity={setActivity}
          />
          <React.Suspense fallback={<div />}>
            <FullThreadView
              activity={activity}
              conversation={activity}
              handlers={handlers}
            />
          </React.Suspense>
        </div>
        {flexCol && <div className="grow" />}
        <div className="flex flex-col w-full border-l border-gray-300 dark:border-gray-800">
          <React.Suspense fallback={<div></div>}>
            <ChatArea project={project} activity={activity} />
          </React.Suspense>
        </div>
      </div>
    </Frame>
  );
}
