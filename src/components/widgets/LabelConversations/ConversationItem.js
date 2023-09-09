import React from "react";
import classnames from "classnames";
import { useLazyQuery, useMutation } from "@apollo/client";
import TimeAgo from "react-timeago";

import GenerateConversationPropertiesFromYaml from "src/graphql/queries/GenerateConversationPropertiesFromYaml.gql";
import CreateActivityPropertiesMutation from "src/graphql/mutations/CreateActivityProperties.gql";
import DeleteActivityPropertiesMutation from "src/graphql/mutations/DeleteActivityProperties.gql";
import utils from "src/utils";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ManageActivityProperty from "./ManageActivityProperty";
import Loader from "src/components/domains/ui/Loader";

export default function ConversationItem({
  project,
  activity,
  setActivities,
  yaml,
  trigger,
  propertyNames,
  replaceExistingProperties = true,
  controlledProperties = [],
  selectedRows,
  setSelectedRows,
  propertyFilters,
}) {
  const [loading, setLoading] = React.useState(false);
  const previousTrigger = utils.usePrevious(trigger);
  const [preview, setPreview] = React.useState(false);

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

      setLoading(false);
      setSelectedRows((selectedRows) =>
        selectedRows.filter((rowId) => rowId !== activityId)
      );
    },
    [
      activity,
      setActivities,
      deleteActivityProperties,
      createActivityProperties,
      replaceExistingProperties,
      setSelectedRows,
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

  const isSelected = selectedRows.includes(activity.id);

  React.useEffect(() => {
    if (trigger > 0 && trigger !== previousTrigger && isSelected) {
      setLoading(true);
      generateProperties();
    }
  }, [trigger, previousTrigger, generateProperties, isSelected]);

  const toggleSelection = React.useCallback(() => {
    const { id } = activity;
    if (!isSelected) {
      setSelectedRows((selectedRows) => [...selectedRows, id]);
    } else {
      setSelectedRows((selectedRows) =>
        selectedRows.filter((rowId) => rowId !== id)
      );
    }
  }, [activity, setSelectedRows, isSelected]);

  const titleProperty = utils.getProperty("title", activity);
  const handlers = {};

  return (
    <tr
      className={classnames("border-y border-gray-100 dark:border-gray-800", {
        "dark:bg-opacity-30 dark:bg-fuchsia-900": isSelected,
        "dark:bg-opacity-10 bg-gray-50 dark:bg-fuchsia-900": !isSelected,
      })}
    >
      <td className="p-2 align-middle">
        {loading && <Loader />}
        {!loading && (
          <input
            type="checkbox"
            onChange={toggleSelection}
            checked={isSelected}
          />
        )}
      </td>
      <td className="relative p-2">
        <div className="w-[350px] overflow-hidden" onClick={toggleSelection}>
          <>
            <div className="font-semibold">
              {titleProperty?.value || activity.text.slice(0, 30) + "..."}
            </div>
            <div className="flex space-x-3 whitespace-nowrap">
              <div className="text-primary max-w-[100px] overflow-hidden text-ellipsis">
                {activity.member.globalActorName}
              </div>
              <div>
                <SourceIcon activity={activity} />
              </div>
              <div
                className="underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview((preview) => !preview);
                }}
              >
                {activity.descendants.length - 1} replies
              </div>
              <TimeAgo
                date={activity.timestamp}
                title={utils.formatDate(activity.timestamp)}
              />
            </div>
          </>
          {preview && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setPreview(false);
              }}
              className="absolute w-[600px] max-h-[500px] overflow-y-scroll left-0 top-14 bg-gray-100 dark:bg-gray-900 shadow-lg z-[1000] border dark:border-gray-800 border-gray-200"
            >
              <FullThreadView
                activity={activity}
                conversation={activity}
                handlers={handlers}
              />
            </div>
          )}
        </div>
      </td>
      {controlledProperties.map(({ name, values }) => (
        <td className="p-2" key={name}>
          <ManageActivityProperty
            project={project}
            activity={activity}
            setActivities={setActivities}
            propertyName={name}
            propertyValues={values}
            setLoading={setLoading}
          />
        </td>
      ))}
      {propertyFilters.map(({ name }) => {
        const properties = utils.getProperties(name, activity);
        return (
          <td className="p-2" key={name}>
            <div className="inline-flex flex-col max-w-40 space-y-[2px]">
              {properties.map((property, index) => (
                <div
                  key={index}
                  className="border-opacity-70 py-1 px-2 text-xs text-fuchsia-800 rounded border border-fuchsia-800"
                >
                  {property?.value}
                </div>
              ))}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
