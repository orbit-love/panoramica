import { getCsrfToken } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";

import Wrapper from "src/components/wrapper";
import HomePage from "app/home-page";

export default async function Page() {
  const props = await getProps();
  return (
    <Wrapper session={props.session}>
      <HomePage {...props} />
    </Wrapper>
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
