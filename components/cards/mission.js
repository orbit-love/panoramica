import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import CompactMember from "components/compact/member";

export default function Mission({ members, setSelection }) {
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
        <div className="text-2xl font-semibold">
          Members: {members.list.length}
        </div>
      </div>
      <div className="flex flex-col space-y-2 max-h-[45vh] overflow-scroll">
        {[1, 2, 3, 4].map((number) => (
          <>
            <div className="" style={{ color: c.orbitLevelColorScale(number) }}>
              <span className="font-bold">Orbit {number}</span>
            </div>
            <div className="flex flex-col space-y-0">
              {members.filterMembers({ levelNumber: number }).map((member) => (
                <CompactMember
                  key={member.id}
                  member={member}
                  setSelection={setSelection}
                  metrics={true}
                />
              ))}
            </div>
          </>
        ))}
      </div>
      {/* <table className="table border-separate [border-spacing:0]">
        <tbody>
          <tr>
            <td className="w-48">Total Members</td>
            <td>{members.list.length}</td>
          </tr>
          {[1, 2, 3, 4].map((number) => (
            <tr key={number} style={{ color: c.orbitLevelColorScale(number) }}>
              <td>
                <span className="pl-3">Orbit {number}</span>
              </td>
              <td>
                {
                  members.list.filter((member) => member.level === number)
                    .length
                }
              </td>
            </tr>
          ))}
          {members.connections?.size > 0 && (
            <>
              <tr>
                <td className="">Total Connections</td>
                <td>{members.connections?.size}</td>
              </tr>
              <tr>
                <td>
                  <span className="pl-3">Most Connected</span>
                </td>
                <td>
                  {mostConnectedMember?.name} (
                  {mostConnectedMember?.connections?.length})
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table> */}
    </div>
  );
}
