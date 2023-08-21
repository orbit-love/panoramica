import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { checkApp, authorizeProject } from "src/auth";
import generatePropertiesFromYaml from "src/graphql/resolvers/activity/generatePropertiesFromYaml";
import { getBaseClient } from "src/graphql/apollo-client";
import ReplaceActivityPropertiesMutation from "src/graphql/mutations/ReplaceActivityProperties.gql";
import coreYaml from "src/configuration/definitions/core.yaml";

export async function POST(_, context) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id, activityId } = context.params;

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

    const projectId = project.id;
    const yaml = coreYaml;
    const modelName = "gpt-4";
    const temperature = 0.1;

    const properties = await generatePropertiesFromYaml({
      projectId,
      activityId,
      yaml,
      modelName,
      temperature,
    });

    // replace all the old properties with the new ones
    const propertiesWithNode = properties.map((property) => ({
      node: property,
    }));

    await getBaseClient().mutate({
      mutation: ReplaceActivityPropertiesMutation,
      variables: {
        id: activityId,
        properties: propertiesWithNode,
      },
    });

    return NextResponse.json({ properties }, { status: 200 });
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
