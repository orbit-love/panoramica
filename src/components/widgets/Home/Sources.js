import React from "react";
import { gql } from "graphql-tag";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import utils from "src/utils";

const GET_SOURCES = gql`
  query ($projectId: ID!) {
    projects(where: { id: $projectId }) {
      sources
    }
  }
`;

export default function Sources({ project, handlers, newPanelPosition }) {
  const { onClickSource } = handlers;

  const { id: projectId } = project;
  const {
    data: {
      projects: [{ sources }],
    },
  } = useSuspenseQuery(GET_SOURCES, {
    variables: {
      projectId,
    },
  });

  return (
    <div className="flex flex-col items-start w-full">
      <div className="text-tertiary font-semibold">Sources</div>
      {sources.map((source) => (
        <button
          key={source}
          className="flex items-center space-x-1"
          onClick={(e) =>
            onClickSource(e, source, {
              position: newPanelPosition(),
            })
          }
        >
          <div>{utils.titleize(source)}</div>
        </button>
      ))}
    </div>
  );
}
