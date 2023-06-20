import React, { useEffect, useState, useCallback } from "react";

import c from "lib/common";
import Stats from "lib/community/stats";

export default function StatsComponent({
  project,
  community,
  stats,
  setStats,
}) {
  const fetchStats = useCallback(async () => {
    fetch(`/api/projects/${project.id}/stats`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          console.log("Error fetching stats", message);
        } else {
          var stats = new Stats({ result });
          setStats(stats);
        }
      });
  }, [project.id, setStats]);

  // do only on mount
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex items-baseline space-x-2">
      {stats && community && (
        <table className="table border-separate [border-spacing:0] text-sm w-full">
          <thead>
            <tr>
              <td className="w-1/3 font-semibold"></td>
              <td className="w-24 font-semibold">In View</td>
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
