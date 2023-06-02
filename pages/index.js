import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

import c from "lib/common";
import Head from "components/head";
import Header from "components/header";
import Vizualization from "components/visualization";

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
          />
        )}
      </div>
    </>
  );
}
