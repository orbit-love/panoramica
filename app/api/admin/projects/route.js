import { NextResponse } from "next/server";
import { checkApp } from "src/auth";
import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { mergeProject } from "src/data/graph/mutations";
import GetPrismaProjectsQuery from "src/graphql/queries/GetPrismaProjects.gql";
import { graph } from "src/data/db";

const putHandler = async () => {
  const user = await checkApp();
  if (!user?.admin) {
    return NextResponse.json(
      {
        message: "You are not allowed to perform this action",
      },
      {
        status: 401,
      }
    );
  }

  const session = graph.session();
  try {
    const {
      data: { prismaProjects },
    } = await getClient().query({
      query: GetPrismaProjectsQuery,
    });

    await session.writeTransaction(async (tx) => {
      for (const prismaProject of prismaProjects) {
        await mergeProject({
          project: prismaProject,
          user: prismaProject.user,
          tx,
        });
      }
    });

    return NextResponse.json({ done: "true" });
  } catch (e) {
    console.error("Projects update failed", e);
    return NextResponse.json(
      { message: "true" },
      {
        status: 500,
      }
    );
  }
};

export { putHandler as PUT };
