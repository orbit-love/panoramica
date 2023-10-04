import { baseClient } from "src/graphql/apollo-wrapper";

import GenerateConversationPropertiesFromYaml from "src/graphql/queries/GenerateConversationPropertiesFromYaml.gql";
import CreateConversationPropertiesMutation from "src/graphql/mutations/CreateConversationProperties.gql";
import DeleteConversationPropertiesMutation from "src/graphql/mutations/DeleteConversationProperties.gql";

export const labelConversation = async ({
  project,
  conversation,
  yaml,
  replaceExistingProperties = true,
}) => {
  const client = baseClient()();

  const projectId = project.id;
  const conversationId = conversation.id;

  const {
    data: {
      projects: [
        {
          conversations: [{ generatePropertiesFromYaml }],
        },
      ],
    },
  } = await client.query({
    query: GenerateConversationPropertiesFromYaml,
    fetchPolicy: "no-cache",
    variables: {
      projectId,
      conversationId,
      yaml,
    },
  });

  var finalProperties = [...conversation.properties];

  if (replaceExistingProperties) {
    const propertyNames = generatePropertiesFromYaml.map(({ name }) => name);
    const where = { node: { name_IN: propertyNames } };
    await client.mutate({
      mutation: DeleteConversationPropertiesMutation,
      variables: {
        id: conversationId,
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

  // doing these one at a time is a workaround for a memgraph crash
  // related to use of with *
  for (let propertyWithNode of propertiesWithNode) {
    await client.mutate({
      mutation: CreateConversationPropertiesMutation,
      variables: {
        id: conversationId,
        properties: [propertyWithNode],
      },
    });
  }

  // push the new properties on
  finalProperties.push(...generatePropertiesFromYaml);

  const newConversation = { ...conversation, properties: finalProperties };
  return newConversation;
};
