import React from "react";
import { useMutation } from "@apollo/client";
import { Frame } from "src/components/widgets";
import ImportActivities from "src/components/widgets/ManageData/ImportActivities";
import { orbitImportReady } from "src/integrations/ready";
import DeleteAllConversationPropertiesMutation from "src/graphql/mutations/DeleteAllConversationProperties.gql";

export default function ManageData({ project }) {
  const [refetchNow, setRefetchNow] = React.useState(false);

  return (
    <Frame fullWidth>
      <div className="p-4">
        <div className="flex flex-col space-y-10">
          <div>
            {orbitImportReady(project) && (
              <ImportActivities project={project} refetchNow={refetchNow} />
            )}
          </div>
          <div>
            <div className="text-tertiary text-lg font-light">
              Manage Queues
            </div>
            <ManageQueues setRefetchNow={setRefetchNow} />
          </div>
          <div>
            <div className="text-tertiary text-lg font-light">Danger Zone</div>
            <RemoveData project={project} />
          </div>
        </div>
      </div>
    </Frame>
  );
}

const ManageQueues = ({ setRefetchNow }) => {
  const [status, setStatus] = React.useState("");
  const [processing, setProcessing] = React.useState(false);
  const [stats, setStats] = React.useState({});

  const postAdminQueues = React.useCallback(async () => {
    setStatus("");
    await fetch(`/api/admin/queues`, {
      method: "POST",
    });
    setStatus(`Queues started`);
  }, [setStatus]);

  const getAdminQueues = React.useCallback(async () => {
    const response = await fetch(`/api/admin/queues`);
    const json = await response.json();
    setStats(json.result);
  }, [setStats]);

  const deleteAdminQueues = React.useCallback(async () => {
    if (confirm("Delete all queues?")) {
      setStatus("");
      await fetch(`/api/admin/queues`, {
        method: "DELETE",
      });
      setStatus("Queues deleted");
      getAdminQueues();
    }
  }, [setStatus, getAdminQueues]);

  React.useEffect(() => {
    getAdminQueues();
  }, [getAdminQueues]);

  // set up a useEffect that detects changes in the processing function
  // and starts and stops processing accordingly
  React.useEffect(() => {
    var timeout;
    const putAdminQueues = async () => {
      await getAdminQueues();
      setStatus("Processing...");
      const response = await fetch(`/api/admin/queues`, { method: "PUT" });
      const data = await response.json();
      setStatus(`${data.jobsProcessed} jobs processed`);
      timeout = setTimeout(putAdminQueues, 5000);
    };

    if (processing) {
      putAdminQueues();
    } else {
      setStatus("");
    }

    return () => timeout && clearTimeout(timeout);
  }, [processing, setStatus, getAdminQueues]);

  React.useEffect(() => {
    if (processing) {
      const interval = setInterval(() => {
        getAdminQueues();
        setRefetchNow((refetchNow) => refetchNow + 1);
      }, 1000);
      return () => interval && clearInterval(interval);
    }
  }, [processing, setRefetchNow, getAdminQueues]);

  const QueueStats = ({ stats, refresh }) => (
    <div className="space-y-1">
      <div className="flex space-x-2">
        <div className="text-tertiary text-lg font-light">
          Queue Information
        </div>
        <button type="button" className="hover:underline" onClick={refresh}>
          refresh
        </button>
      </div>
      <table className="border-spacing-5 -ml-1 text-left table-auto">
        <thead>
          <th>
            <div className="p-1 font-semibold">Queue</div>
          </th>
          <th>
            <div className="p-1">Waiting</div>
          </th>
          <th>
            <div className="p-1">Active</div>
          </th>
          <th>
            <div className="p-1">Completed</div>
          </th>
          <th>
            <div className="p-1">Failed</div>
          </th>
          <th>
            <div className="p-1">Delayed</div>
          </th>
        </thead>
        <tbody>
          {Object.values(stats).map(
            ({ queueName, waiting, active, completed, failed, delayed }) => (
              <tr key={queueName}>
                <td className="p-1">{queueName}</td>
                <td className="p-1">{waiting}</td>
                <td className="p-1">{active}</td>
                <td className="p-1">{completed}</td>
                <td className="p-1">{failed}</td>
                <td className="p-1">{delayed}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col items-start mt-1 space-y-1">
      {status && (
        <div>
          <div className="text-green-500">{status}</div>
        </div>
      )}
      <button
        className="cursor-pointer hover:underline"
        onClick={deleteAdminQueues}
      >
        Clear Queues
      </button>
      <button
        className="cursor-pointer hover:underline"
        onClick={postAdminQueues}
      >
        Start Workers (Background)
      </button>
      {processing && (
        <button
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => setProcessing(false)}
        >
          Stop Processing (Sync)
        </button>
      )}
      {!processing && (
        <button
          className="cursor-pointer hover:underline"
          onClick={() => setProcessing(true)}
        >
          Start Processing (Sync)
        </button>
      )}
      <div className="h-4"></div>
      <QueueStats stats={stats} refresh={getAdminQueues} />
    </div>
  );
};

const RemoveData = ({ project }) => {
  const [status, setStatus] = React.useState("");

  const clearProject = React.useCallback(async () => {
    setStatus("");
    if (
      confirm("Are you sure you want to remove all data from this project?")
    ) {
      await fetch(`/api/projects/${project.id}/clear`, {
        method: "DELETE",
      });
      setStatus(
        `Data removed, please refresh the page and close any open tabs`
      );
    }
  }, [project, setStatus]);

  const [deleteAllConversationPropertiesMutation] = useMutation(
    DeleteAllConversationPropertiesMutation,
    {
      variables: {
        projectId: project.id,
      },
      onCompleted: () => {
        setStatus(`Properties deleted`);
      },
    }
  );

  const deleteProperties = React.useCallback(async () => {
    setStatus("");
    if (confirm("Are you sure you want to delete all generated properties?")) {
      deleteAllConversationPropertiesMutation();
    }
  }, [setStatus, deleteAllConversationPropertiesMutation]);

  return (
    <div className="flex flex-col items-start space-y-1">
      <button
        className="text-red-500 cursor-pointer hover:underline"
        onClick={clearProject}
      >
        Remove all data from this project
      </button>
      <button
        className="text-red-500 cursor-pointer hover:underline"
        onClick={deleteProperties}
      >
        Delete all generated properties
      </button>
      {status && <div className="text-green-500">{status}</div>}
    </div>
  );
};
