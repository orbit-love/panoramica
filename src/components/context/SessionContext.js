"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import _ from "src/configuration/icons";

export default function SessionContext({ session, children }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
