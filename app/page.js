import { redirect } from "next/navigation";
import { getCsrfToken } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "src/auth/nextAuthOptions";

import HomePage from "app/HomePage";

export default async function Page() {
  const props = await getProps();
  const { session } = props;
  // redirect to the projects view if the user is already logged in
  if (session?.user) {
    redirect("/projects");
  }
  return <HomePage {...props} />;
}

export async function getProps() {
  const session = await getServerSession(authOptions);
  const csrfToken = (await getCsrfToken(authOptions)) || "";
  return {
    session,
    csrfToken,
  };
}
