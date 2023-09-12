import React from "react";
import { useMutation } from "@apollo/client";
import { Frame } from "src/components/widgets";
import ImportActivities from "src/components/widgets/ManageData/ImportActivities";
import { orbitImportReady } from "src/integrations/ready";
import DeleteAllConversationPropertiesMutation from "src/graphql/mutations/DeleteAllConversationProperties.gql";

export default function ManageData({ project }) {
  return (
    <Frame>
      <div className="p-4">
        <div className="text-tertiary pb-4 text-lg font-light">Manage Data</div>
        <div className="flex flex-col space-y-10">
          <div>
            {orbitImportReady(project) && (
              <ImportActivities project={project} />
            )}
          </div>
          <div>
            <div className="text-tertiary font-light">Remove Data</div>
            <RemoveData project={project} />
          </div>
          <div>
            <div className="text-tertiary font-light">Manage Queues</div>
            <StartQueues />
          </div>
        </div>
      </div>
    </Frame>
  );
}

const StartQueues = ({}) => {
  const [status, setStatus] = React.useState("");

  const postAdminQueues = React.useCallback(async () => {
    setStatus("");
    await fetch(`/api/admin/queues`, {
      method: "POST",
    });
    setStatus(`Queues started`);
  }, [setStatus]);

  return (
    <div className="flex flex-col space-y-1">
      <div className="underline cursor-pointer" onClick={postAdminQueues}>
        Start Queues
      </div>
      {status && <div className="text-green-500">{status}</div>}
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
    <div className="flex flex-col space-y-1">
      <div
        className="text-red-500 underline cursor-pointer"
        onClick={clearProject}
      >
        Remove all data from this project
      </div>
      <div
        className="text-red-500 underline cursor-pointer"
        onClick={deleteProperties}
      >
        Delete all generated properties
      </div>
      {status && <div className="text-green-500">{status}</div>}
    </div>
  );
};
