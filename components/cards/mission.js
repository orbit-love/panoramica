import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import c from "lib/common";

export default function Mission({ members }) {
  const mostConnectedMember = members.list.sort(
    (a, b) => b.connections?.length - a.connections?.length
  )[0];
  return (
    <div className="flex flex-col space-y-4">
      <div
        className="flex items-baseline space-x-2"
        style={{ color: c.visualization.sun.fill }}
      >
        <div>
          <FontAwesomeIcon icon="planet-ringed" className="text-2xl" />
        </div>
        <div className="text-2xl font-semibold">Mission</div>
      </div>
      <div className="italic text-sm">{c.orbitModel.mission}</div>
      <div className="border-b border-indigo-900"></div>
      <table className="table border-separate [border-spacing:0]">
        <tbody>
          <tr>
            <td className="w-48">Total Members</td>
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
  );
}
