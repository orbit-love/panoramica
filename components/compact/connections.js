import React from "react";
import CompactConnection from "components/compact/connection";

export default function CompactConnections({
  member,
  community,
  selection,
  setSelection,
  connection,
  setConnection,
  onClick,
}) {
  // if the connection doesn't exist, right now it could
  // be because the time slider reducer and some members aren't there
  // that's bad though, so this is a protection for now
  const mapActor = (actor) => community.findMemberByActor(actor);

  const sortByFields = (a, b) => {
    var [outgoingA, incomingA] = member.connections[a.globalActor];
    var [outgoingB, incomingB] = member.connections[b.globalActor];
    var connectionStrengthSort =
      outgoingB + incomingB - (outgoingA + incomingA);
    var orbitLevelSort = a.level - b.level;

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
    return connectionStrengthSort || orbitLevelSort || nameSort;
  };

  const mutuals = Object.keys(member.connections)
    .filter((actor) => {
      var [outgoing, incoming] = member.connections[actor];
      return outgoing > 0 && incoming > 0;
    })
    .map(mapActor)
    .filter((a) => a)
    .sort(sortByFields);

  const outgoing = Object.keys(member.connections)
    .filter((actor) => {
      var [outgoing, incoming] = member.connections[actor];
      return outgoing > 0 && incoming === 0;
    })
    .map(mapActor)
    .filter((a) => a)
    .sort(sortByFields);

  const incoming = Object.keys(member.connections)
    .filter((actor) => {
      var [outgoing, incoming] = member.connections[actor];
      return outgoing === 0 && incoming > 0;
    })
    .map(mapActor)
    .filter((a) => a)
    .sort(sortByFields);

  const Connections = ({ name, connections }) => {
    return (
      <>
        {connections.length > 0 && (
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col pb-2">
              <div className="pb-1 font-semibold text-indigo-400">{name}</div>
              <div className="flex flex-col">
                {connections.map((connectedMember) => (
                  <CompactConnection
                    key={connectedMember.id}
                    member={member}
                    connectedMember={connectedMember}
                    selection={selection}
                    setSelection={setSelection}
                    connection={connection}
                    setConnection={setConnection}
                    directions={member.connections[connectedMember.globalActor]}
                    onClick={onClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
  return (
    <>
      <Connections name="Mutuals" connections={mutuals} />
      <Connections name="Mentioned" connections={outgoing} />
      <Connections name="Mentioned By" connections={incoming} />
    </>
  );
}
