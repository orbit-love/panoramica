import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { checkApp, authorizeProject } from "src/auth";
import GetConversationsQuery from "src/graphql/queries/GetConversations.gql";
import generatePropertiesFromYaml from "src/graphql/resolvers/activity/generatePropertiesFromYaml";
import { getBaseClient } from "src/graphql/apollo-client";
import SetActivityPropertiesMutation from "src/graphql/mutations/SetActivityProperties.gql";
import DeleteActivityPropertiesMutation from "src/graphql/mutations/DeleteActivityProperties.gql";
import coreYaml from "src/configuration/definitions/core.yaml";

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

    const {
      data: {
        projects: [
          {
            activitiesConnection: { edges, pageInfo },
          },
        ],
      },
    } = await getClient().query({
      query: GetConversationsQuery,
      variables: {
        projectId,
        first: 10,
        after: cursor || "",
      },
    });

    // filter out replies and activities that already have properties
    const activities = edges
      .map((edge) => edge.node)
      .filter((activity) => activity.id === activity.conversationId)
      .filter((activity) => activity.propertiesConnection.totalCount === 0);

    const yaml = coreYaml;

    const promises = activities.map(async (activity) => {
      // update the schema via a mutation
      const { id: activityId } = activity;
      const modelName = "gpt-3.5-turbo";
      const temperature = 0.1;
      const properties = await generatePropertiesFromYaml({
        projectId,
        activityId,
        yaml,
        modelName,
        temperature,
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
      await getBaseClient().mutate({
        mutation: SetActivityPropertiesMutation,
        variables: {
          id: activityId,
          properties: propertiesWithNode,
        },
      });

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
