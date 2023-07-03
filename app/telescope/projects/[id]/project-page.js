"use client";

import React, { useEffect, useState, useRef } from "react";
import Header from "components/header";
import Vizualization from "components/visualization";

export default function Page({ _project }) {
  const containerRef = useRef();
  const [project, setProject] = useState(_project);

  const [dimensions, setDimensions] = useState({
    height: null,
    width: null,
  });
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
            width={dimensions.width}
            height={dimensions.height}
            fullscreen={fullscreen}
            setFullscreen={setFullscreen}
            project={project}
            setProject={setProject}
          />
        )}
      </div>
    </>
  );
}
