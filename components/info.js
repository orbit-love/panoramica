import React, { useEffect } from "react";
import Prose from "components/visualization/prose";

export default function Info({ members }) {
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
            Combine the fullscreen, animation, and shuffle toggles to create an
            immersive, interactive experience.
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
          {/* <tr>
            <td className="font-semibold">Connections</td>
            <td>{members.connections?.size}</td>
          </tr> */}
        </div>
      </div>
    </>
  );
}
