import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import fetch from "node-fetch";

import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { checkApp, authorizeProject } from "src/auth";
import GetConversationsQuery from "src/graphql/queries/GetConversations.gql";
import { cookies } from "next/headers";

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

    // only fetch converstions: activities with descendants
    const where = {
      AND: [
        {
          node: {
            descendantsAggregate: { count_GTE: 1 },
          },
        },
      ],
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
      query: GetConversationsQuery,
      variables: {
        projectId,
        first: 5,
        after: cursor || "",
        where,
      },
    });

    const activities = edges.map((edge) => edge.node);

    const promises = activities.map(async (activity) => {
      try {
        const hostName = process.env.NEXTAUTH_URL;
        const url = `${hostName}/api/projects/${projectId}/${activity.id}/properties`;
        const response = await fetch(url, {
          method: "POST",
          headers: { Cookie: cookies().toString() },
        });
        console.log(
          "Fetched properties from URL " +
            url +
            " with status " +
            response.status
        );
        return response;
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
