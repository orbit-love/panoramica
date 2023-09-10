import React, { useCallback } from "react";
import { useMutation } from "@apollo/client";

import ReplaceActivityPropertyMutation from "src/graphql/mutations/ReplaceActivityProperty.gql";
import utils from "src/utils";

export default function ManageActivityProperty({
  propertyName,
  project,
  activity,
  setActivities,
  propertyValues,
  setLoading,
  onSave,
}) {
  const property = utils.getProperty(propertyName, activity);
  const projectId = project.id;
  const activityId = activity.id;
  const [value, setValue] = React.useState(property?.value);

  const [replaceActivityProperty] = useMutation(
    ReplaceActivityPropertyMutation,
    {
      variables: {
        projectId,
        activityId,
        name: propertyName,
        type: "String",
      },
    }
  );

  const replaceProperty = useCallback(
    async (value) => {
      setLoading(true);
      await replaceActivityProperty({
        variables: {
          value,
        },
      });
      if (onSave) {
        onSave();
      }
      setActivities((activities) => {
        const newActivities = [...activities];
        const index = newActivities.findIndex(({ id }) => id === activity.id);
        newActivities[index] = {
          ...newActivities[index],
          properties: [
            ...newActivities[index].properties.filter(
              (p) => p.name !== propertyName
            ),
            {
              name: propertyName,
              value,
            },
          ],
        };
        return newActivities;
      });
      setLoading(false);
    },
    [
      replaceActivityProperty,
      activity,
      propertyName,
      setActivities,
      setLoading,
      onSave,
    ]
  );

  const onChange = useCallback(
    (e) => {
      const { value } = e.target;
      setValue(value);
      replaceProperty(value);
    },
    [replaceProperty]
  );

  return (
    <select onChange={onChange} value={value} className="!text-xs">
      <option value={""}>--</option>
      {propertyValues.map((propertyValue) => (
        <option key={propertyValue} value={propertyValue}>
          {propertyValue}
        </option>
      ))}
    </select>
  );
}
