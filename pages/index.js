import Orbits from "components/orbits";
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
import Example from "content/example.mdx";
import Funnel from "content/funnel.mdx";
import Stars from "components/stars";
import { useRouter } from "next/router";

function getInitialNumber(router) {
  const queryKey = "n";
  var number =
    router.query[queryKey] ||
    router.asPath.match(new RegExp(`[&?]${queryKey}=(.*)(&|$)`));
  if (typeof number === "object") {
    if (number !== null) {
      number = parseInt(number[1]);
    }
  }
  if (!number) {
    number = 50;
  }
  return number;
}

export default function Index() {
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({
    height: null,
    width: null,
  });
  const [fix, setFix] = useState(false);

  const router = useRouter();
  const [number, setNumber] = useState(getInitialNumber(router));

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
        {dimensions.width && dimensions.height && (
          <Orbits
            width={dimensions.width}
            height={dimensions.height}
            number={number}
            setNumber={setNumber}
          />
        )}
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
          <section id="example" className="pb-12">
            <Example />
          </section>
          <div className="prose my-8 border-b border-violet-100"></div>
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
