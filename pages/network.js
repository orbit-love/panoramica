import React, { useEffect, useState, useRef } from "react";
import Head from "components/head";
import c from "lib/common";
import helper from "lib/visualization/helper";
import MemberGraph from "components/member-graph";

export default function Network() {
  const containerRef = useRef();
  const [members, setMembers] = useState(null);
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

  useEffect(() => {
    const { width, height } = dimensions;
    const levels = helper.generateLevels({ width, height });
    const theMembers = helper.generateMembers({
      levels,
      advocateCount: 2,
    });
    setMembers(theMembers);
  }, [dimensions, setMembers]);

  return (
    <>
      <Head />
      <div
        ref={containerRef}
        id="container"
        style={{
          height: "100vh",
          marginTop: "0",
          backgroundColor: c.purpleBgColor,
        }}
      >
        {members && (
          <MemberGraph
            members={members}
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </div>
    </>
  );
}
