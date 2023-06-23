import React, { useEffect } from "react";

import c from "lib/common";

export default function StatsComponent({ community, stats, fetchStats }) {
  // do only on mount
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex items-baseline space-x-2 w-full">
      {stats && community && (
        <table className="table border-separate [border-spacing:0] text-sm w-full whitespace-nowrap">
          <thead>
            <tr>
              <td className="w-2/3 font-semibold"></td>
              <td className="w-1/3 font-semibold">Filtered</td>
              <td className="font-semibold">Total</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="w-1/3">Activities</td>
              <td>{community.activities.length}</td>
              <td>{stats.activities.count}</td>
            </tr>
            <tr>
              <td className="">Members</td>
              <td>{community.members.length}</td>
              <td>{stats.members.count}</td>
            </tr>
            <tr>
              <td className="">Connections</td>
              <td>{community.getConnectionCount()}</td>
              <td>{stats.members.connections.count}</td>
            </tr>
            <tr>
              <td className="">Density</td>
              <td>
                {community.members.length > 0 &&
                  String(
                    c.round(
                      community.getConnectionCount() / community.members.length
                    )
                  )}
              </td>
              <td>
                {String(
                  c.round(stats.members.connections.count / stats.members.count)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
