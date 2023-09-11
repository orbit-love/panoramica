import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import CompactConnection from "src/components/domains/member/Connection";
import GetMessagedWithQuery from "./GetMessagedWith.gql";

export default function CompactConnections({ project, member, onClick }) {
  const defaultSort = { lastInteractedAt: "DESC" };
  const [messagedWith, setMessagedWith] = useState([]);
  const [sort, setSort] = useState(defaultSort);
  const [expanded, setExpanded] = useState(false);

  const { id: memberId } = member;
  const { id: projectId } = project;

  const {} = useQuery(GetMessagedWithQuery, {
    variables: { memberId, projectId, sort },
    onCompleted: (data) => {
      const {
        projects: [
          {
            members: [
              {
                messagedWithConnection: { edges: messagedWith },
              },
            ],
          },
        ],
      } = data;
      setMessagedWith(messagedWith);
    },
  });

  const limit = 10;
  var messagedWithSlice = expanded
    ? messagedWith
    : messagedWith.slice(0, limit);

  if (messagedWithSlice.length == 0) {
    return <></>;
  }

  return (
    <div className="flex flex-col px-6 space-y-2">
      <div className="flex justify-between items-baseline w-full">
        <div className="text-tertiary text-lg">
          Connections {messagedWith.length}
        </div>
        <div className="flex items-baseline space-x-3 text-sm whitespace-nowrap">
          <div className="grow" />
          <div className="text-tertiary">Sort by: </div>
          <div
            className={classnames("", {
              "cursor-pointer underline text-gray-400": !sort.lastInteractedAt,
              "text-tertiary": sort.lastInteractedAt,
            })}
            onClick={() => {
              if (!sort.lastInteractedAt) setSort({ lastInteractedAt: "DESC" });
            }}
          >
            <span>Last Interaction</span>
          </div>
          <div
            className={classnames("", {
              "cursor-pointer underline text-gray-400": !sort.conversationCount,
              "text-tertiary": sort.conversationCount,
            })}
            onClick={() => {
              if (!sort.conversationCount)
                setSort({ conversationCount: "DESC" });
            }}
          >
            <FontAwesomeIcon
              icon="comment"
              flip="horizontal"
              className="mr-1"
            />
            <span>Conversations</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {messagedWithSlice.map(
          ({
            node: connectedMember,
            activities: activityIds,
            lastInteractedAt,
            activityCount,
            conversationCount,
          }) => (
            <CompactConnection
              key={connectedMember.id}
              member={member}
              connectedMember={connectedMember}
              activityCount={activityCount}
              conversationCount={conversationCount}
              lastInteractedAt={lastInteractedAt}
              activityIds={activityIds}
              onClick={onClick}
            />
          )
        )}
        {!expanded && messagedWith.length > limit && (
          <button
            className="text-tertiary mt-1 font-light text-left hover:underline"
            onClick={() => setExpanded(true)}
          >
            show more
          </button>
        )}
        {expanded && (
          <button
            className="text-tertiary mt-1 font-light text-left hover:underline"
            onClick={() => setExpanded(false)}
          >
            show less
          </button>
        )}
      </div>
    </div>
  );
}
