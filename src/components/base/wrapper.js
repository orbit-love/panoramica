"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import _ from "components/icons";

export default function Wrapper({ session, children }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
