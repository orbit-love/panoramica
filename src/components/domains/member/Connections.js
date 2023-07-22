import React, { useState } from "react";
import CompactConnection from "src/components/domains/member/Connection";

export default function CompactConnections({ member, community, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const connections = community.findConnections(member) || [];

  const sortByFields = (a, b) => {
    var lastInteractionA = connections[a.globalActor][2];
    var lastInteractionB = connections[b.globalActor][2];

    // last resort, sort by name
    var nameSort = 0,
      nameA = a.globalActorName?.toLowerCase(),
      nameB = b.globalActorName?.toLowerCase();
    if (nameA < nameB) {
      nameSort = -1;
    }
    if (nameA > nameB) {
      nameSort = 1;
    }
    return lastInteractionB - lastInteractionA || nameSort;
  };

  var connectedMembers = Object.keys(connections)
    .map((globalActor) => community.findMemberByGlobalActor(globalActor))
    .sort(sortByFields);

  const limit = 10;
  var connectedMembersSlice = expanded
    ? connectedMembers
    : connectedMembers.slice(0, limit);

  return (
    <>
      {connectedMembers.length > 0 && (
        <div className="flex flex-col px-6 space-y-3">
          <div className="flex flex-col pb-2">
            <div className="text-tertiary pb-1 font-light">Connections</div>
            <div className="flex flex-col">
              {connectedMembersSlice.map((connectedMember) => (
                <CompactConnection
                  key={connectedMember.globalActor}
                  member={member}
                  connectedMember={connectedMember}
                  connection={connections[connectedMember.globalActor]}
                  onClick={onClick}
                />
              ))}
              {!expanded && connectedMembers.length > limit && (
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
