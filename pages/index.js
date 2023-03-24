import Orbits from "components/2023/orbits";
import React, { useEffect, useState, useRef } from "react";
import Head from "components/head";
import Header from "components/header";
import Footer from "components/footer";
import Sidebar from "components/sidebar";
import Intro from "content/intro.mdx";
import Model from "content/model.mdx";
import OrbitLevels from "content/orbit-levels.mdx";
import Stars from "components/stars";

export default function Index() {
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({
    height: null,
    width: null,
  });
  const [fix, setFix] = useState(false);

  useEffect(() => {
    const handleScroll = (event) => {
      const containerHeight = containerRef.current.offsetHeight - 78;
      const newFix = window.scrollY >= containerHeight;
      setFix(newFix);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const fixClass = fix ? "md:pl-64 mt-24" : "";
  return (
    <>
      <Head />
      <Header fix={fix} />
      <Stars />
      <div
        ref={containerRef}
        id="container"
        style={{ height: "65vh", marginTop: "-80px" }}
      >
        <Orbits width={dimensions.width} height={dimensions.height} />
      </div>
      <div className="flex py-3 px-9 pt-10 pb-20 bg-white md:space-x-16">
        <Sidebar fix={fix} />
        <div className={`${fixClass} flex flex-col space-y-10 w-full`}>
          <section className="anchor" id="introduction">
            <h1 className="mb-6 text-4xl font-bold">
              Build a high-gravity community
            </h1>
            <Intro />
          </section>
          <section id="model">
            <Model />
          </section>
          <section id="orbit-levels">
            <OrbitLevels />
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
