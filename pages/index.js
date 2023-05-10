import Orbits from "components/orbits";
import React, { useEffect, useState, useRef } from "react";
import Head from "components/head";
import Header from "components/header";
import Footer from "components/footer";
import Sidebar from "components/sidebar";
import Introduction from "content/introduction.mdx";
import Gravity from "content/gravity.mdx";
import OrbitLevels from "content/orbit-levels.mdx";
import Reach from "content/reach.mdx";
import Love from "content/love.mdx";
import Example from "content/example.mdx";
import Funnel from "content/funnel.mdx";
import Stars from "components/stars";
import Image from "next/image";
import { useRouter } from "next/router";
import atomicHeart from "public/atomic-heart.svg";

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
    number = 4;
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

  const fixClass = fix ? "md:pl-56 mt-12" : "";

  return (
    <>
      <Head />
      <Header fix={fix} />
      <Stars />
      <div
        ref={containerRef}
        id="container"
        className="hidden relative sm:block"
        style={{ height: "100vh", marginTop: "-100px" }}
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
      <div className="pt-20 bg-[#1F154C] sm:hidden text-center">
        <Image alt="Atomic heart" src={atomicHeart} />
      </div>
      <div className="flex justify-center bg-white sm:pt-10">
        <div className="flex relative">
          <Sidebar fix={fix} />
          <div className={`${fixClass} flex flex-col px-4 md:px-0`}>
            {/* pb-12 is here instead of space-y-12 to avoid gaps in sidebar scroll highlighting */}
            <section className="anchor pb-12" id="introduction">
              <h1 className="mb-6 text-4xl font-bold">
                Build strong, scalable communities
              </h1>
              <Introduction />
            </section>
            <section id="gravity" className="pb-12">
              <Gravity />
            </section>
            <section id="love" className="pb-12">
              <Love />
            </section>
            <section id="reach" className="pb-12">
              <Reach />
            </section>
            <section id="orbit-levels" className="pb-12">
              <OrbitLevels />
            </section>
            <section id="example" className="pb-12">
              <Example />
            </section>
            <section id="funnel" className="prose pb-12 my-8">
              <div className="px-6 py-8 bg-violet-50">
                <Funnel />
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
