import React, { useState, useCallback } from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { gql } from "graphql-tag";

import { putProjectImport } from "src/data/client/fetches";
import Loader from "src/components/domains/ui/Loader";
import utils from "src/utils";

export default function ImportActivities({ project, refetchNow }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState(null);

  const { refetch } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
    variables: {
      projectId: project.id,
    },
    onCompleted: (data) => {
      const {
        projects: [
          {
            activitiesAggregate: {
              count,
              node: { timestampInt },
            },
          },
        ],
      } = data;
      var { min, max } = timestampInt;
      setStats({ min: parseInt(min), max: parseInt(max), count });
      if (min && max) {
        setEndDate(new Date(min).toISOString().slice(0, 10));
        // set the start date to 6 months earlier
        const d = new Date(min);
        d.setMonth(d.getMonth() - 6);
        setStartDate(d.toISOString().slice(0, 10));
      }
    },
  });

  React.useEffect(() => {
    if (refetchNow) {
      refetch();
    }
  }, [refetchNow, refetch]);

  const importProject = useCallback(async () => {
    setStatus("");
    putProjectImport({
      project,
      setLoading,
      body: JSON.stringify({
        startDate,
        endDate,
      }),
      onSuccess: ({ result: { status } }) => {
        setStatus(`Success! ${status}`);
        refetch();
      },
    });
  }, [project, startDate, endDate, setLoading, refetch]);

  const onSubmit = (e) => {
    e.preventDefault();
    importProject();
  };

  return (
    <form className="space-y-2" onSubmit={onSubmit}>
      <div className="text-tertiary text-lg font-light">Import Activities</div>
      <div className="space-y-1">
        <div className="flex space-x-1">
          <label className="font-semibold">Orbit Workspace:</label>
          <div>{project.workspace}</div>
        </div>
        {stats && (
          <>
            <div className="flex space-x-1">
              <label className="font-semibold">Oldest Activity:</label>
              <div>{utils.formatDate(stats.min)}</div>
            </div>
            <div className="flex space-x-1">
              <label className="font-semibold">Newest Activity:</label>
              <div>{utils.formatDate(stats.max)}</div>
            </div>
            <div className="flex space-x-1">
              <label className="font-semibold">Total Activities:</label>
              <div>{stats.count}</div>
            </div>
          </>
        )}
      </div>
      {project.orbitApiUrl && (
        <div className="flex space-x-1">
          <label>Orbit API URL:</label>
          <div>{project.url}</div>
        </div>
      )}
      <div className="flex space-x-3">
        <div className="flex flex-col space-y-1">
          <label>From</label>
          <input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label>To</label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>
      <div />
      <div className="inline-flex items-center space-x-4">
        <button type="submit" className="btn">
          {loading ? <Loader className="text-white" /> : <span>Enqueue</span>}
        </button>
        <button
          type="button"
          className="btn !bg-gray-500"
          onClick={() => refetch()}
        >
          <span>Refresh</span>
        </button>
        {status && <div className="text-green-500">{status}</div>}
      </div>
    </form>
  );
}

const query = gql`
  query ($projectId: ID!) {
    projects(where: { id: $projectId }) {
      activitiesAggregate {
        count
        node {
          timestampInt {
            min
            max
          }
        }
      }
    }
  }
`;
