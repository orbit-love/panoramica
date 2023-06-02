import { PrismaClient } from "@prisma/client";

const getMembers = async (prisma) => {
  const members = await prisma.member.findMany({});
  return {
    props: { members },
    revalidate: 10,
  };
};

const prisma = new PrismaClient();
// Start fetching data
getMembers(prisma)
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
