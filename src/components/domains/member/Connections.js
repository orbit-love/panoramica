import React from "react";
import CompactConnection from "src/components/domains/member/Connection";

export default function CompactConnections({ member, community, onClick }) {
  // if the connection doesn't exist, right now it could
  // be because the time slider reducer and some members aren't there
  // that's bad though, so this is a protection for now
  const mapActor = (actor) => community.findMemberByActor(actor);

  // TODO: Figure out why actor is different than member which doesn't have the lastInteraction
  const actor = mapActor(member.globalActor);

  const sortByFields = (a, b) => {
    var lastInteractionA = actor.connections[a.globalActor][2];
    var lastInteractionB = actor.connections[b.globalActor][2];

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

  const connections = Object.keys(member.connections)
    .filter((actor) => {
      var [outgoing, incoming] = member.connections[actor];
      return outgoing > 0 && incoming > 0;
    })
    .map(mapActor)
    .filter((a) => a)
    .sort(sortByFields);

  return (
    <>
      {connections.length > 0 && (
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col pb-2">
            <div className="pb-1 font-semibold text-indigo-400">
              Connections
            </div>
            <div className="flex flex-col">
              {connections.map((connection) => (
                <CompactConnection
                  key={connection.id}
                  member={actor}
                  connection={connection}
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
