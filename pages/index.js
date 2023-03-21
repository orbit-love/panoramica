import Orbits from "components/2023/orbits";
import React from "react";
import Head from "components/head";
import Header from "components/header";
import Footer from "components/footer";
import Sidebar from "components/sidebar";
import Intro from "content/intro.mdx";
import Gravity from "content/gravity.mdx";

export default function Index() {
  return (
    <div id="outer-container">
      <Head />
      <Header />
      <div id="container" className="bg-[#0F0A25]">
        <Orbits />
      </div>
      <div className="ccccmb-9 flex py-3 px-9 mt-10 md:space-x-16">
        <Sidebar />
        <div className="w-full">
          <a id="introduction"></a>
          {/* It takes a community to raise a product */}
          <h1 className="mb-6 text-4xl font-bold">
            Product adoption: it takes a community
          </h1>
          <Intro />
          <a className="block my-12" id="gravity"></a>
          <Gravity />
        </div>
        <div className="my-64"></div>
      </div>
      <Footer />
    </div>
  );
}
