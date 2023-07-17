"use client";

import React from "react";

import Header from "src/components/widgets/base/Header";
import Login from "src/components/domains/auth/Login";

export default function HomePage({ csrfToken }) {
  return (
    <>
      <Header />
      <div
        id="container"
        className="flex flex-col justify-center items-center"
        style={{
          height: "100vh",
          marginTop: "0",
        }}
      >
        <div className="flex flex-col items-center space-y-2 w-full font-thin">
          <h1 className="text-3xl">Panoramica</h1>
          <Login csrfToken={csrfToken} />
        </div>
      </div>
    </>
  );
}
