import React, { useCallback } from "react";
import { useMutation } from "@apollo/client";

import ReplaceConversationPropertyMutation from "src/graphql/mutations/ReplaceConversationProperty.gql";
import utils from "src/utils";

export default function ManageConversationProperty({
  propertyName,
  project,
  conversation,
  setConversations,
  propertyValues,
  setLoading,
  onSave,
}) {
  const property = utils.getProperty(propertyName, conversation);
  const projectId = project.id;
  const conversationId = conversation.id;
  const [value, setValue] = React.useState(property?.value);

  const [replaceConversationProperty] = useMutation(
    ReplaceConversationPropertyMutation,
    {
      variables: {
        projectId,
        conversationId,
        name: propertyName,
        type: "String",
      },
    }
  );

  const replaceProperty = useCallback(
    async (value) => {
      setLoading(true);
      await replaceConversationProperty({
        variables: {
          value,
        },
      });
      if (onSave) {
        onSave();
      }
      setConversations((conversations) => {
        const newConversations = [...conversations];
        const index = newConversations.findIndex(
          ({ id }) => id === conversation.id
        );
        newConversations[index] = {
          ...newConversations[index],
          properties: [
            ...newConversations[index].properties.filter(
              (p) => p.name !== propertyName
            ),
            {
              name: propertyName,
              value,
            },
          ],
        };
        return newConversations;
      });
      setLoading(false);
    },
    [
      replaceConversationProperty,
      conversation,
      propertyName,
      setConversations,
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
