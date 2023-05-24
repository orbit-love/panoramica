import React, { useEffect } from "react";

export default function Info({ members }) {
  const mostConnectedMember = members.list.sort(
    (a, b) =>
      members.getConnections({ member: b }).length -
      members.getConnections({ member: a }).length
  )[0];
  return (
    <>
      <div className="flex flex-col py-4 px-5 space-y-2 pointer-events-auto">
        <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
        <table className="table border-separate [border-spacing:0] text-sm">
          <tbody>
            <tr>
              <td>left</td>
              <td>Previous member</td>
            </tr>
            <tr>
              <td>right</td>
              <td>Next member</td>
            </tr>
            <tr>
              <td>a</td>
              <td>Animation on/off</td>
            </tr>
            <tr>
              <td>r</td>
              <td>Change animation speed</td>
            </tr>
            <tr>
              <td>c</td>
              <td>Cycle members</td>
            </tr>
            <tr>
              <td>n</td>
              <td>Network view</td>
            </tr>
            <tr>
              <td>f</td>
              <td>Enter fullscreen</td>
            </tr>
            <tr>
              <td>i</td>
              <td>Information view</td>
            </tr>
          </tbody>
        </table>
        <h3 className="text-lg font-bold">Presentation Mode</h3>
        <p className="text-sm">
          Combine the fullscreen, animation, and cycling options for an
          immersive experience.
        </p>
        <h3 className="text-lg font-bold">Community Stats</h3>
        <table className="table border-separate [border-spacing:0] text-sm">
          <tbody>
            <tr>
              <td className="">Members</td>
              <td>{members.list.length}</td>
            </tr>
            {[1, 2, 3, 4].map((number) => (
              <tr key={number}>
                <td>
                  <span className="pl-3">Orbit {number}</span>
                </td>
                <td>
                  {
                    members.list.filter(
                      (member) => member.level.number === number
                    ).length
                  }
                </td>
              </tr>
            ))}
            {/* <tr className="h-4" /> */}
            <tr>
              <td className="">Total Connections</td>
              <td>{members.connections?.size}</td>
            </tr>
            <tr>
              <td>
                <span className="pl-3">Most Connected</span>
              </td>
              <td>
                {mostConnectedMember.name} (
                {members.getConnections({ member: mostConnectedMember }).length}
                )
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
