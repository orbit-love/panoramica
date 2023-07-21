"use client";

import React from "react";
import Image from "next/image";

import Login from "src/components/domains/auth/Login";
import logo from "public/logo.png";
import Themed from "src/components/context/Themed";

export default function HomePage({ csrfToken }) {
  return (
    <Themed>
      <div className="flex flex-col justify-center items-center w-full h-full">
        <div className="flex flex-col items-center space-y-2 w-full">
          <Image src={logo} alt="Panoramica logo" width="125" />
          <h1 className="text-3xl font-thin tracking-wider">panoramica</h1>
          <div className="h-6" />
          <Login csrfToken={csrfToken} />
        </div>
        <div className="h-24" />
      </div>
    </Themed>
  );
}
