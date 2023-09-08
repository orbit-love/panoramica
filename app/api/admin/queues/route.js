import { NextResponse } from "next/server";

const handler = async () => {
  await import("src/workers/orbit/importActivities");
  return NextResponse.json({ started: "true" });
};

export { handler as POST };
