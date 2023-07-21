import React from "react";
import CompactConnection from "src/components/domains/member/Connection";

export default function CompactConnections({ member, community, onClick }) {
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

  const connectedMembers = Object.keys(connections)
    .map((globalActor) => community.findMemberByGlobalActor(globalActor))
    .sort(sortByFields);

  return (
    <>
      {connectedMembers.length > 0 && (
        <div className="flex flex-col px-4 space-y-3">
          <div className="flex flex-col pb-2">
            <div className="text-tertiary pb-1 font-light">Connections</div>
            <div className="flex flex-col">
              {connectedMembers.map((connectedMember) => (
                <CompactConnection
                  key={connectedMember.globalActor}
                  member={member}
                  connectedMember={connectedMember}
                  connection={connections[connectedMember.globalActor]}
                  onClick={onClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
