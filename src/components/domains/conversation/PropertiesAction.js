import React, { useCallback, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "src/components/ui/Modal";
import GenerateConversationPropertiesFromYaml from "src/graphql/queries/GenerateConversationPropertiesFromYaml.gql";
import CreateActivityPropertiesMutation from "src/graphql/mutations/CreateActivityProperties.gql";
import DeleteActivityPropertiesMutation from "src/graphql/mutations/DeleteActivityProperties.gql";
import Loader from "src/components/domains/ui/Loader";
import coreYaml from "src/configuration/definitions/core.yaml";

export default function PropertiesAction({
  project,
  activity,
  setActivity,
  className,
}) {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen((open) => !open);
  };

  return (
    <>
      <button
        title="Show properties"
        onClick={toggleOpen}
        className={className}
      >
        <FontAwesomeIcon icon="file-code" />
      </button>
      {open &&
        createPortal(
          <Modal title="View Properties" close={toggleOpen}>
            <PropertiesModal
              project={project}
              activity={activity}
              setActivity={setActivity}
            />
          </Modal>,
          document.body
        )}
    </>
  );
}

const PropertiesModal = ({ project, activity, setActivity }) => {
  const [properties, setProperties] = useState(activity.properties);

  const [deleteActivityProperties] = useMutation(
    DeleteActivityPropertiesMutation
  );
  const [createActivityProperties] = useMutation(
    CreateActivityPropertiesMutation
  );

  const handleGeneratedProperties = useCallback(
    async (data) => {
      const { id: activityId } = activity;
      const {
        projects: [
          {
            activities: [{ generatePropertiesFromYaml }],
          },
        ],
      } = data;

      setProperties(generatePropertiesFromYaml);
      setActivity({ ...activity, properties: generatePropertiesFromYaml });

      await deleteActivityProperties({
        variables: {
          id: activityId,
        },
      });
      const propertiesWithNode = generatePropertiesFromYaml.map(
        ({ name, value, type }) => ({
          node: { name, value, type },
        })
      );
      await createActivityProperties({
        variables: {
          id: activityId,
          properties: propertiesWithNode,
        },
      });
    },
    [activity, setActivity, deleteActivityProperties, createActivityProperties]
  );

  const [generateProperties, { loading }] = useLazyQuery(
    GenerateConversationPropertiesFromYaml,
    {
      onCompleted: handleGeneratedProperties,
      fetchPolicy: "no-cache",
      variables: {
        projectId: project.id,
        activityId: activity.id,
        yaml: coreYaml,
      },
    }
  );

  return (
    <div className="overflow-x-auto overflow-y-scroll p-6">
      <table className="w-full text-left table-auto">
        <thead>
          <tr>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Type</th>
            <th className="py-2 px-4">Value</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border border-gray-500">
                <code>{property.name}</code>
              </td>
              <td className="py-2 px-4 border border-gray-500">
                {property.type}
              </td>
              <td className="py-2 px-4 border border-gray-500">
                {property.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center mt-6 space-x-2">
        <div
          onClick={() => generateProperties()}
          className="text-tertiary cursor-pointer hover:underline"
          title="Generate Properties"
        >
          Generate Properties
        </div>
        {loading && <Loader />}
      </div>
    </div>
  );
};
