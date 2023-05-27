import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Scroll from "react-scroll";

import c from "lib/common";
import Head from "components/head";
import Header from "components/header";
import Footer from "components/footer";
import Sidebar from "components/sidebar";
import Vizualization from "components/visualization";
import ProseSection from "components/prose-section";
import Introduction from "content/introduction.mdx";
import Gravity from "content/gravity.mdx";
import OrbitLevels from "content/orbit-levels.mdx";
import Reach from "content/reach.mdx";
import Love from "content/love.mdx";
import Resources from "content/resources.mdx";
import atomicHeart from "public/atomic-heart.svg";
import backToTop from "public/back-to-top.png";

export default function Index() {
  const router = useRouter();
  const containerRef = useRef();

  const [dimensions, setDimensions] = useState({
    height: null,
    width: null,
  });
  const [number] = useState(c.getInitialNumber(router));
  const [fix, setFix] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const scrollToIntroduction = () => {
    if (fullscreen) {
      document.exitFullscreen().then(() => setFullscreen(false));
    }
    const scroll = Scroll.animateScroll;
    scroll.scrollTo(window.innerHeight - 42);
  };

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [setFullscreen]);

  useEffect(() => {
    const handleScroll = () => {
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

  const fixClass = fix ? "md:pl-56" : "";

  return (
    <>
      <Head />
      <Header fix={fix} fullscreen={fullscreen} />
      <div
        ref={containerRef}
        id="container"
        className="space-gradient hidden relative sm:block"
        style={{
          height: "100vh",
          marginTop: "0",
        }}
      >
        {dimensions.width && dimensions.height && (
          <Vizualization
            width={dimensions.width}
            height={dimensions.height}
            number={number}
            fullscreen={fullscreen}
            setFullscreen={setFullscreen}
            scrollToIntroduction={scrollToIntroduction}
          />
        )}
      </div>
      <div className="pt-20 bg-[#1F154C] sm:hidden text-center">
        <Image alt="Atomic heart" src={atomicHeart} />
      </div>
      <div className="flex justify-center bg-white sm:pt-10">
        <div className="flex relative pt-4">
          <Sidebar fix={fix} />
          <div className={`${fixClass} flex flex-col px-4 md:px-0`}>
            {/* pb-12 is here instead of space-y-12 to avoid gaps in sidebar scroll highlighting */}
            <ProseSection
              className="anchor"
              id="introduction"
              name="introduction"
            >
              <h1 className="pt-0 mt-0 mb-8 text-4xl font-bold">
                Build strong, scalable communities
              </h1>
              <Introduction />
            </ProseSection>
            <ProseSection id="gravity">
              <Gravity />
            </ProseSection>
            <ProseSection id="love">
              <Love />
            </ProseSection>
            <ProseSection id="reach">
              <Reach />
            </ProseSection>
            <ProseSection id="orbit-levels">
              <OrbitLevels />
            </ProseSection>
            <ProseSection id="resources">
              <Resources />
            </ProseSection>
            <ProseSection id="ending">
              <div className="flex flex-col justify-center space-y-10">
                <div className="md:mx-24">
                  <Image alt="Astronaut on top of a planet" src={backToTop} />
                </div>
                <div className="text-center">
                  <button
                    onClick={scrollToIntroduction}
                    className="py-3 px-12 font-semibold text-white bg-indigo-700 rounded-md select-none hover:bg-indigo-600"
                  >
                    Back to top
                  </button>
                </div>
              </div>
            </ProseSection>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
