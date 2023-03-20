import Orbits from "components/2023/orbits";
import React from "react";
import Head from "components/head";
import Header from "components/header";
import Sidebar from "components/sidebar";

export default function Index() {
  return (
    <div id="outer-container">
      <Head />
      <Header />
      <div id="container" className="bg-[#0F0A25]">
        <Orbits />
      </div>
      <div className="flex py-3 px-9 mt-6 mb-9 md:space-x-16">
        <Sidebar />
        <div className="space-y-4 w-full">
          <div className="text-4xl">
            Build a high-gravity community with the Orbit Model
          </div>
          <div className="prose">
            The Orbit Model is a framework for building high gravity
            communities. A high gravity community is one that excels at
            attracting and retaining members by providing an outstanding member
            experience and increasing the bonds between members.
          </div>
        </div>
        <div className="my-64"></div>
      </div>
    </div>
  );
}
