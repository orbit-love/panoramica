import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Info({ members, setShowInfo }) {
  const mostConnectedMember = members.list.sort(
    (a, b) => b.connections.length - a.connections.length
  )[0];
  return (
    <>
      <div className="flex relative flex-col py-4 px-5 space-y-4 pointer-events-auto">
        <div>
          <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
          <table className="table border-separate [border-spacing:0] text-sm">
            <tbody>
              <tr>
                <td className="w-24">left</td>
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
                <td>s</td>
                <td>Animation speed</td>
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
        </div>
        <div>
          <h3 className="text-lg font-bold">Presentation Mode</h3>
          <p className="text-sm">
            Combine the fullscreen, animation, and cycling options for an
            immersive experience.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Community Stats</h3>
          <table className="table border-separate [border-spacing:0] text-sm">
            <tbody>
              <tr>
                <td className="w-48">Members</td>
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
                  {mostConnectedMember.connections.length})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          className="absolute top-0 right-6 text-lg"
          onClick={() => setShowInfo(false)}
        >
          <FontAwesomeIcon icon="xmark" />
        </button>
      </div>
    </>
  );
}
