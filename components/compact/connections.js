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
          return (
            <CompactConnection
              key={actor}
              member={member}
              connection={community.findMemberByActor(actor)}
              setSelection={setSelection}
              directions={directions}
            />
          );
        })}
    </>
  );
}
