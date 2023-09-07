import React, { useState, useCallback } from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { gql } from "graphql-tag";

import { putProjectImport } from "src/data/client/fetches";
import Loader from "src/components/domains/ui/Loader";
import utils from "src/utils";

export default function ImportActivities({ project }) {
  const [startDate, setStartDate] = useState("2022-01-01");
  const [endDate, setEndDate] = useState("2023-01-01");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState(null);

  const { refetch } = useQuery(query, {
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
      const { min, max } = timestampInt;
      setStats({ min, max, count });
    },
  });

  const importProject = useCallback(async () => {
    setStatus("");
    putProjectImport({
      project,
      setLoading,
      body: JSON.stringify({
        startDate,
        endDate,
      }),
      onSuccess: ({ result: { count } }) => {
        setStatus(`Success! ${count} activities imported`);
        refetch();
      },
    });
  }, [project, startDate, endDate, setLoading, refetch]);

  const repairProject = useCallback(async () => {
    setStatus("");
    setLoading(true);
    await fetch(`/api/projects/${project.id}/repair`, {
      method: "POST",
    });
    setStatus(`Success! Project repaired`);
    setLoading(false);
    refetch();
  }, [project, setLoading, refetch]);

  const onSubmit = (e) => {
    e.preventDefault();
    importProject();
  };

  return (
    <form className="inline-flex-col space-y-2" onSubmit={onSubmit}>
      <div className="text-tertiary font-light">Import Activities</div>
      <div>
        <div className="flex space-x-1">
          <label className="font-semibold">Workspace:</label>
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
          {loading ? <Loader className="text-white" /> : <span>Import</span>}
        </button>
        <button type="button" className="btn" onClick={repairProject}>
          {loading ? <Loader className="text-white" /> : <span>Repair</span>}
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
