import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { checkApp, authorizeProject } from "src/auth";
import GetConversationsQuery from "src/graphql/queries/GetConversations.gql";
import generateProperties from "src/graphql/resolvers/activity/generateProperties";
import { propertyDefinitions } from "src/configuration/propertyDefinitions";
import { getBaseClient } from "src/graphql/apollo-client";
import SetActivityPropertiesMutation from "src/graphql/mutations/SetActivityProperties.gql";
import DeleteActivityPropertiesMutation from "src/graphql/mutations/DeleteActivityProperties.gql";

export async function POST(request, context) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id } = context.params;
  var { cursor } = await request.json();

  try {
    var project = await authorizeProject({ id, user });
    if (!project) {
      return NextResponse.json(
        {
          message: "Access denied",
        },
        { status: 401 }
      );
    }

    var projectId = project.id;

    var query = GetConversationsQuery;
    var variables = {
      projectId,
      first: 1,
      after: cursor || "",
    };

    const {
      data: {
        projects: [
          {
            activitiesConnection: { edges, pageInfo },
          },
        ],
      },
    } = await getClient().query({
      query,
      variables,
    });

    // filter out replies
    const activities = edges
      .map((edge) => edge.node)
      .filter((activity) => activity.id === activity.conversationId);

    const definitions = propertyDefinitions;

    const promises = activities.map(async (activity) => {
      // update the schema via a mutation
      const { id: activityId } = activity;
      const properties = await generateProperties({
        projectId,
        activityId,
        definitions,
      });

      // clear the existing properties
      await getBaseClient().mutate({
        mutation: DeleteActivityPropertiesMutation,
        variables: {
          id: activityId,
        },
      });

      const propertiesWithNode = properties.map((property) => ({
        node: property,
      }));

      // set the new ones
      const mutationResult = await getBaseClient().mutate({
        mutation: SetActivityPropertiesMutation,
        variables: {
          id: activityId,
          properties: propertiesWithNode,
        },
      });

      console.log("mutationResult", mutationResult);
      return properties;
    });

    await Promise.all(promises);

    if (pageInfo.hasNextPage) {
      return NextResponse.json(
        {
          ...pageInfo,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ complete: true }, { status: 200 });
    }
  } catch (err) {
    console.log(err);
    console.log(JSON.stringify(err, null, 2));
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
