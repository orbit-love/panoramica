import React from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetSourcesQuery from "./GetSources.gql";
import utils from "src/utils";

export default function Sources({ project, handlers, newPanelPosition }) {
  const { onClickSource } = handlers;

  const { id: projectId } = project;
  const {
    data: {
      projects: [{ sources }],
    },
  } = useSuspenseQuery(GetSourcesQuery, {
    variables: {
      projectId,
    },
  });

  return (
    <div className="flex flex-col items-start w-full">
      <div className="text-tertiary font-semibold">Sources</div>
      {sources.map((source) => (
        <div
          key={source}
          className="flex items-center space-x-1 cursor-pointer hover:underline"
          onClick={(e) =>
            onClickSource(e, source, {
              position: newPanelPosition(),
            })
          }
        >
          <div>{utils.titleize(source)}</div>
        </div>
      ))}
    </div>
  );
}
