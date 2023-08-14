import React, { useState } from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import CompactConnection from "src/components/domains/member/Connection";
import GetMessagedWithQuery from "./GetMessagedWith.gql";

export default function CompactConnections({ project, member, onClick }) {
  const [expanded, setExpanded] = useState(false);

  const { globalActor: memberId } = member;
  const { id: projectId } = project;

  const {
    data: {
      projects: [
        {
          members: [
            {
              messagedWithConnection: { edges: messagedWith },
            },
          ],
        },
      ],
    },
  } = useSuspenseQuery(GetMessagedWithQuery, {
    variables: { memberId, projectId },
  });

  const limit = 10;
  var messagedWithSlice = expanded
    ? messagedWith
    : messagedWith.slice(0, limit);

  return (
    <>
      {messagedWithSlice.length > 0 && (
        <div className="flex flex-col px-6 space-y-3">
          <div className="flex flex-col pb-2">
            <div className="text-tertiary pb-1 font-light">Messaged With</div>
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
                    key={connectedMember.globalActor}
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
        </div>
      )}
    </>
  );
}
