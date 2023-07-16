"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import Header from "src/components/header";
import Panel from "src/components/panel";
import Login from "src/components/login";

export default function HomePage({ session, csrfToken }) {
  const user = session?.user;

  return (
    <>
      <Header />
      <div
        id="container"
        className="flex flex-col justify-center items-center text-indigo-100"
        style={{
          height: "100vh",
          marginTop: "0",
        }}
      >
        <div className="flex flex-col items-center space-y-2 w-full font-thin">
          <h1 className="text-3xl">Panoramica</h1>
          {!user && <Login csrfToken={csrfToken} />}
          {user && (
            <>
              <div className="flex space-x-4 text-sm">
                <span>Signed in as {user.email}</span>
                <button className="underline" onClick={() => signOut()}>
                  Sign out
                </button>
              </div>
              <div className="h-6"></div>
              <Panel className="px-8 py-8 w-1/3">
                <div className="flex flex-col space-y-6 w-full">
                  <div className="flex flex-col items-baseline space-y-1">
                    <div className="text-lg font-bold">Available Previews</div>
                    <div className="text-lg">
                      <Link className="underline" href={`/skydeck`}>
                        <span>Skydeck</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>
    </>
  );
}
