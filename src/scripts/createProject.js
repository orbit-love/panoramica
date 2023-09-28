import { prisma, graph } from "src/data/db";
import { setupProject } from "src/data/graph/mutations";

export const execute = async ({
  workspace,
  name = workspace,
  apiKey,
  typesenseUrl,
  typesenseApiKey,
}) => {
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
      workspace,
    },
  });

  const possibleData = {
    name,
    workspace,
    apiKey,
    demo: true,
    typesenseUrl,
    typesenseApiKey,
  };
  // filter out any absent values
  const data = Object.fromEntries(
    Object.entries(possibleData).filter(([_, v]) => v != null)
  );

  if (existingProject) {
    await prisma.project.update({
      where: {
        id: existingProject.id,
      },
      data,
    });
  } else {
    const result = await prisma.project.create({
      data: {
        ...data,
        user: {
          connect: { email: user.email },
        },
      },
    });
    console.log("Created project", result);
  }

  // refind the project with all the select fields needed for setupProject
  var project = await prisma.project.findFirst({
    where: {
      workspace,
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

  if (!project) {
    console.log("Project could not be updated or created!");
    process.exit(1);
  }

  const session = graph.session();
  await session.writeTransaction(async (tx) => {
    await setupProject({ tx, project, user: project.user });
  });
  session.close();

  console.log(project.id);
};

const main = async () => {
  const workspace = process.argv[process.argv.indexOf("--workspace") + 1];
  const apiKey = process.env.ORBIT_API_KEY;
  const typesenseUrl =
    process.argv[process.argv.indexOf("--typesense-url") + 1];
  const typesenseApiKey = process.env.TYPESENSE_API_KEY;

  if (!workspace || !apiKey || !typesenseUrl || !typesenseApiKey) {
    console.error(
      "Workspace and API key and Typesense url/apiKey are required!"
    );
    process.exit(1);
  }

  await execute({ workspace, apiKey, typesenseUrl, typesenseApiKey });
};

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
