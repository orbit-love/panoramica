import React from "react";
import classnames from "classnames";
import { createPortal } from "react-dom";
import { useLazyQuery, useMutation } from "@apollo/client";

import GenerateConversationPropertiesFromYaml from "src/graphql/queries/GenerateConversationPropertiesFromYaml.gql";
import CreateActivityPropertiesMutation from "src/graphql/mutations/CreateActivityProperties.gql";
import DeleteActivityPropertiesMutation from "src/graphql/mutations/DeleteActivityProperties.gql";
import utils from "src/utils";
import Modal from "src/components/ui/Modal";

export default function ConversationItem({
  project,
  activity,
  setActivities,
  yaml,
  trigger,
  replaceExistingProperties = true,
}) {
  const [state, setState] = React.useState("Process");
  const [open, setOpen] = React.useState(false);
  const previousTrigger = utils.usePrevious(trigger);

  const [deleteActivityProperties] = useMutation(
    DeleteActivityPropertiesMutation
  );
  const [createActivityProperties] = useMutation(
    CreateActivityPropertiesMutation
  );

  const handleGeneratedProperties = React.useCallback(
    async (data) => {
      const { id: activityId } = activity;
      const {
        projects: [
          {
            activities: [{ generatePropertiesFromYaml }],
          },
        ],
      } = data;

      var finalProperties = [...activity.properties];

      if (replaceExistingProperties) {
        const propertyNames = generatePropertiesFromYaml.map(
          ({ name }) => name
        );
        const where = { node: { name_IN: propertyNames } };
        await deleteActivityProperties({
          variables: {
            id: activityId,
            where,
          },
        });

        // remove the properties that were deleted from the finalProperties
        finalProperties = finalProperties.filter((property) => {
          return !propertyNames.includes(property.name);
        });
      }

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

      // push the new properties on
      finalProperties.push(...generatePropertiesFromYaml);

      const newActivity = { ...activity, properties: finalProperties };
      setActivities((activities) =>
        activities.map((a) => (a.id === activityId ? newActivity : a))
      );
      setState("Done!");
    },
    [
      activity,
      setActivities,
      deleteActivityProperties,
      createActivityProperties,
      replaceExistingProperties,
    ]
  );

  const [generateProperties] = useLazyQuery(
    GenerateConversationPropertiesFromYaml,
    {
      onCompleted: handleGeneratedProperties,
      fetchPolicy: "no-cache",
      variables: {
        projectId: project.id,
        activityId: activity.id,
        yaml: yaml,
      },
    }
  );

  const toggleOpen = () => {
    setOpen((open) => !open);
  };

  React.useEffect(() => {
    if (trigger > 0 && trigger !== previousTrigger) {
      setState("Generating...");
      generateProperties();
    }
  }, [trigger, previousTrigger, generateProperties]);

  const titleProperty = utils.getProperty("title", activity);
  return (
    <tr
      className={classnames({
        "opacity-50": activity.properties.length === 0,
      })}
    >
      <td>
        <div className="flex space-x-4">
          <div className="font-semibold">
            {titleProperty?.value || activity.text.slice(0, 15)}
          </div>
          <div>{activity.member.globalActorName}</div>
        </div>
        <div>
          {activity.source} {activity.sourceChannel}
        </div>
        <div className="flex space-x-2">
          <div
            className="underline cursor-pointer"
            onClick={() => setOpen(true)}
          >
            {activity.properties.length} props
          </div>
          <div>{activity.descendantsConnection.totalCount - 1} replies</div>
        </div>
      </td>
      <td>
        <div
          className="underline cursor-pointer"
          onClick={() => {
            setState("Generating...");
            generateProperties();
          }}
        >
          {state}
        </div>
      </td>
      <td>
        {open &&
          createPortal(
            <Modal title="Properties" close={toggleOpen}>
              <div className="p-6">
                <PropertiesTable properties={activity.properties} />
              </div>
            </Modal>,
            document.body
          )}
      </td>
    </tr>
  );
}

const PropertiesTable = ({ properties }) => {
  return (
    <table className="w-full text-left whitespace-nowrap table-auto">
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
  );
};
