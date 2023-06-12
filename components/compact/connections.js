import React from "react";
import CompactConnection from "components/compact/connection";

export default function CompactConnections({
  member,
  community,
  setSelection,
}) {
  return (
    <>
      {Object.keys(member.connections)
        .sort(
          (a, b) =>
            member.connections[b].reduce((a, b) => a + b, 0) -
            member.connections[a].reduce((a, b) => a + b, 0)
        )
        .map((actor) => {
          const directions = member.connections[actor];
          // if the connection doesn't exist, right now it could
          // be because the time slider reducer and some members aren't there
          // that's bad though, so this is a protection for now
          const connection = community.findMemberByActor(actor);
          return (
            connection && (
              <CompactConnection
                key={actor}
                member={member}
                connection={connection}
                setSelection={setSelection}
                directions={directions}
              />
            )
          );
        })}
    </>
  );
}
