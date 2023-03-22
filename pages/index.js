import Orbits from "components/2023/orbits";
import React, { useEffect, useState, useRef } from "react";
import Head from "components/head";
import Header from "components/header";
import Footer from "components/footer";
import Sidebar from "components/sidebar";
import Intro from "content/intro.mdx";
import Model from "content/model.mdx";

export default function Index() {
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({
    height: null,
    width: null,
  });

  useEffect(() => {
    const container = containerRef.current;
    setDimensions({
      height: container.offsetHeight,
      width: container.offsetWidth,
    });

    function handleResize() {
      setDimensions({
        height: container.offsetHeight,
        width: container.offsetWidth,
      });
    }

    window.addEventListener("resize", handleResize);

    return (_) => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setDimensions]);

  return (
    <>
      <Head />
      <Header />
      <div
        ref={containerRef}
        id="container"
        className="bg-[#0F0A25]"
        style={{ height: "65vh" }}
      >
        <Orbits width={dimensions.width} height={dimensions.height} />
      </div>
      <div className="flex py-3 px-9 mb-9 mt-10 md:space-x-16">
        <Sidebar />
        <div className="w-full">
          <a className="anchor" id="introduction"></a>
          <h1 className="mb-6 text-4xl font-bold">
            Product adoption: it takes a community
          </h1>
          <Intro />
          <div className="my-12"></div>
          <a className="anchor" id="model"></a>
          <Model />
        </div>
        <div className="my-64"></div>
      </div>
      <Footer />
    </>
  );
}
