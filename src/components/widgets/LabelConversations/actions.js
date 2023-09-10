import React from "react";
import { baseClient } from "src/graphql/apollo-wrapper";

import GenerateConversationPropertiesFromYaml from "src/graphql/queries/GenerateConversationPropertiesFromYaml.gql";
import CreateActivityPropertiesMutation from "src/graphql/mutations/CreateActivityProperties.gql";
import DeleteActivityPropertiesMutation from "src/graphql/mutations/DeleteActivityProperties.gql";

export const labelActivity = async ({
  project,
  activity,
  yaml,
  replaceExistingProperties = true,
}) => {
  const client = baseClient()();

  const projectId = project.id;
  const activityId = activity.id;

  const {
    data: {
      projects: [
        {
          activities: [{ generatePropertiesFromYaml }],
        },
      ],
    },
  } = await client.query({
    query: GenerateConversationPropertiesFromYaml,
    fetchPolicy: "no-cache",
    variables: {
      projectId,
      activityId,
      yaml,
    },
  });

  var finalProperties = [...activity.properties];

  if (replaceExistingProperties) {
    const propertyNames = generatePropertiesFromYaml.map(({ name }) => name);
    const where = { node: { name_IN: propertyNames } };
    await client.mutate({
      mutation: DeleteActivityPropertiesMutation,
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

  await client.mutate({
    mutation: CreateActivityPropertiesMutation,
    variables: {
      id: activityId,
      properties: propertiesWithNode,
    },
  });

  // push the new properties on
  finalProperties.push(...generatePropertiesFromYaml);

  const newActivity = { ...activity, properties: finalProperties };
  return newActivity;
};
