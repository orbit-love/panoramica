import React from "react";
import CompactConnection from "components/compact/connection";

export default function CompactConnections({
  member,
  community,
  selection,
  setSelection,
  connection,
  setConnection,
}) {
  const sortByMentions = (a, b) => {
    var [outgoingA, incomingA] = member.connections[a];
    var [outgoingB, incomingB] = member.connections[b];
    return outgoingB + incomingB - (outgoingA + incomingA);
  };
  const mutuals = Object.keys(member.connections)
    .filter((actor) => {
      var [outgoing, incoming] = member.connections[actor];
      return outgoing > 0 && incoming > 0;
    })
    .sort(sortByMentions);
  const outgoing = Object.keys(member.connections)
    .filter((actor) => {
      var [outgoing, incoming] = member.connections[actor];
      return outgoing > 0 && incoming === 0;
    })
    .sort(sortByMentions);
  const incoming = Object.keys(member.connections)
    .filter((actor) => {
      var [outgoing, incoming] = member.connections[actor];
      return outgoing === 0 && incoming > 0;
    })
    .sort(sortByMentions);

  const Connections = ({ name, connections }) => {
    // if the connection doesn't exist, right now it could
    // be because the time slider reducer and some members aren't there
    // that's bad though, so this is a protection for now
    var connectedMembers = connections
      .map((actor) => community.findMemberByActor(actor))
      .filter((m) => m);
    return (
      <>
        {connectedMembers.length > 0 && (
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col pb-2">
              <div className="pb-1 font-semibold text-indigo-400">{name}</div>
              <div className="flex flex-col">
                {connectedMembers.map((connectedMember) => (
                  <CompactConnection
                    key={connectedMember.id}
                    member={member}
                    connectedMember={connectedMember}
                    selection={selection}
                    setSelection={setSelection}
                    connection={connection}
                    setConnection={setConnection}
                    directions={member.connections[connectedMember.globalActor]}
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
