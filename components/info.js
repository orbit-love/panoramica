import React, { useEffect } from "react";
import Prose from "components/visualization/prose";

export default function Info({ members }) {
  const mostConnectedMember = members.list.sort(
    (a, b) =>
      members.getConnections({ member: a }) -
      members.getConnections({ member: b })
  )[0];
  return (
    <>
      <div className="flex flex-col py-4 px-5 space-y-6 pointer-events-auto">
        <Prose>
          <h3>Keyboard Shortcuts</h3>
          <p>
            Use the left and right arrow keys to cycle through members of the
            community.
          </p>
        </Prose>
        <Prose>
          <h3>Presentation Mode</h3>
          <p>
            Combine the fullscreen, animation, and shuffle toggles for an
            immersive experience.
          </p>
        </Prose>
        <Prose>
          <h3>Community Stats</h3>
        </Prose>
        <div className="table">
          <tr>
            <td className="font-semibold">Members</td>
            <td>{members.list.length}</td>
          </tr>
          {[1, 2, 3, 4].map((number) => (
            <tr key={number}>
              <td>Orbit {number}</td>
              <td>
                {
                  members.list.filter(
                    (member) => member.level.number === number
                  ).length
                }
              </td>
            </tr>
          ))}
          <tr className="h-4" />
          <tr>
            <td className="font-semibold">Total Connections</td>
            <td>{members.connections?.size}</td>
          </tr>
          <tr>
            <td>Most Connected</td>
            <td>
              {mostConnectedMember.name} (
              {members.getConnections({ member: mostConnectedMember }).length})
            </td>
          </tr>
        </div>
      </div>
    </>
  );
}
