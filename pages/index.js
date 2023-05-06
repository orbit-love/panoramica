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
    number = 3;
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

  const fixClass = fix ? "md:pl-56 mt-24" : "";

  return (
    <>
      <Head />
      <Header fix={fix} />
      <Stars />
      <div
        ref={containerRef}
        id="container"
        className="relative"
        style={{ height: "85vh", marginTop: "-100px" }}
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
      <div className="flex justify-center pt-10 bg-white">
        <div className="flex relative">
          <Sidebar fix={fix} />
          <div className={`${fixClass} flex flex-col px-4 space-y-12 md:px-0`}>
            <section className="anchor" id="introduction">
              <h1 className="mb-6 text-4xl font-bold">
                Build strong, scalable communities
              </h1>
              <Introduction />
            </section>
            <section id="gravity">
              <Gravity />
            </section>
            <section id="love">
              <Love />
            </section>
            <section id="reach">
              <Reach />
            </section>
            <section id="orbit-levels">
              <OrbitLevels />
            </section>
            <section id="example">
              <Example />
            </section>
            {/* <div className="prose my-8 border-b border-violet-100"></div> */}
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
