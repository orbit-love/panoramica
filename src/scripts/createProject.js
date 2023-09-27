import { prisma, graph } from "src/data/db";
import { setupProject } from "src/data/graph/mutations";

export const execute = async ({ workspace, name = workspace, apiKey }) => {
  let user = await prisma.user.findFirst({
    where: {
      admin: true,
    },
  });

  if (!user) {
    console.error("One admin user needs to exist!");
    process.exit(1);
  }

  const existingProject = await prisma.project.findFirst({
    where: {
      workspace: workspace,
    },
  });

  if (existingProject) {
    await prisma.project.update({
      where: {
        id: existingProject.id,
      },
      data: {
        name: name,
        apiKey: apiKey,
        demo: true,
      },
    });
  } else {
    await prisma.project.create({
      data: {
        name: name,
        workspace: workspace,
        apiKey: apiKey,
        demo: true,
        user: {
          connect: { email: user.email },
        },
      },
    });
  }

  // refind the project with all the select fields needed for setupProject
  var project = await prisma.project.findFirst({
    where: {
      workspace: workspace,
    },
    select: {
      id: true,
      name: true,
      demo: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  const session = graph.session();
  await session.writeTransaction(async (tx) => {
    await setupProject({ tx, project, user: project.user });
  });
  session.close();

  console.log(project.id);
};

const main = async () => {
  const workspace = process.argv[process.argv.indexOf("--workspace") + 1];
  const apiKey = process.env.ORBIT_ADMIN_API_KEY;

  if (!workspace || !apiKey) {
    console.error("Workspace and API key are required!");
    process.exit(1);
  }

  await execute({ workspace, apiKey });
};

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
