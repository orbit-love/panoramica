"use client";

import React from "react";
import Image from "next/image";

import Header from "src/components/widgets/base/Header";
import Login from "src/components/domains/auth/Login";
import logo from "public/logo.png";

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
        <div className="flex flex-col items-center space-y-4 w-full">
          <Image src={logo} alt="Panoramica logo" width="95" />
          <h1 className="text-3xl font-thin tracking-wider">panoramica</h1>
          <Login csrfToken={csrfToken} />
        </div>
        <div className="h-36" />
      </div>
    </>
  );
}
