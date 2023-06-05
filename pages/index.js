import React, { useEffect, useState, useRef } from "react";

import Head from "components/head";
import Header from "components/header";
import Vizualization from "components/visualization";

export default function Index() {
  const containerRef = useRef();

  const [dimensions, setDimensions] = useState({
    height: null,
    width: null,
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [members, setMembers] = useState(null);
  const [sort, setSort] = useState("love");
  const [levels, setLevels] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [simulations, setSimulations] = useState([]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [setFullscreen]);

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
      <Header fullscreen={fullscreen} />
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
            members={members}
            setMembers={setMembers}
            width={dimensions.width}
            height={dimensions.height}
            fullscreen={fullscreen}
            setFullscreen={setFullscreen}
            levels={levels}
            setLevels={setLevels}
            sort={sort}
            setSort={setSort}
            simulation={simulation}
            setSimulation={setSimulation}
            simulations={simulations}
            setSimulations={setSimulations}
          />
        )}
      </div>
    </>
  );
}
