import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import fetch from "node-fetch";

import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { checkApp, authorizeProject } from "src/auth";
import GetConversationsQuery from "src/graphql/queries/GetConversations.gql";

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

    const promises = activities.map(async (activity) => {
      try {
        const hostName = process.env.NEXTAUTH_URL;
        const url = `${hostName}/api/projects/${projectId}/${activity.id}/properties`;
        await fetch(url, {
          method: "POST",
        });
        console.log("Fetched activity properties");
      } catch (err) {
        console.log("Error fetching activity properties route", err);
        throw err;
      }
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
