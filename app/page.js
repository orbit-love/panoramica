import { redirect } from "next/navigation";
import { getCsrfToken } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";

import SessionContext from "src/components/context/SessionContext";
import HomePage from "app/HomePage";

export default async function Page() {
  const props = await getProps();
  const { session } = props;
  // redirect to the dashboard if the user is already logged in
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <SessionContext session={session}>
      <HomePage {...props} />
    </SessionContext>
  );
}

export async function getProps() {
  const session = await getServerSession(authOptions);
  const csrfToken = (await getCsrfToken(authOptions)) || "";
  return {
    session,
    csrfToken,
  };
}
