import { PrismaClient } from "@prisma/client";

const getActivities = async () => {
  const prisma = new PrismaClient();

  var records = await prisma.activity.findMany({
    take: 100,
  });
  records = JSON.parse(JSON.stringify(records));

  return {
    props: { records },
  };
};

export default async function handler(req, res) {
  try {
    const result = await getActivities();
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: "failed to load data" });
  }
}
