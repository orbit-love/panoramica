import Orbits from "components/2023/orbits";
import React, { useEffect, useState, useRef } from "react";
import Head from "components/head";
import Header from "components/header";
import Footer from "components/footer";
import Sidebar from "components/sidebar";
import Intro from "content/intro.mdx";
import Gravity from "content/gravity.mdx";
import OrbitLevels from "content/orbit-levels.mdx";
import Reach from "content/reach.mdx";
import Love from "content/love.mdx";
import Conclusion from "content/conclusion.mdx";
import Funnel from "content/funnel.mdx";
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
        className="relative"
        style={{ height: "80vh", marginTop: "-100px" }}
      >
        <Orbits width={dimensions.width} height={dimensions.height} />
      </div>
      <div className="flex py-3 px-9 pt-10 pb-20 bg-white">
        <Sidebar fix={fix} />
        <div className={`${fixClass} flex flex-col`}>
          <section className="anchor pb-12" id="introduction">
            <h1 className="mb-6 text-4xl font-bold">
              Build strong, scalable communities
            </h1>
            <Intro />
          </section>
          <section id="gravity" className="pb-12">
            <Gravity />
          </section>
          <section id="orbit-levels" className="pb-12">
            <OrbitLevels />
          </section>
          <section id="love" className="pb-12">
            <Love />
          </section>
          <section id="reach" className="pb-12">
            <Reach />
          </section>
          <section id="conclusion" className="pb-12">
            <Conclusion />
          </section>
          <section id="funnel" className="prose pb-12">
            <div className="px-6 py-8 bg-violet-50">
              <Funnel />
            </div>
          </section>
          <div className="my-8"></div>
        </div>
      </div>
      <Footer />
    </>
  );
}
