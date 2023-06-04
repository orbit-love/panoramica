import React, { useEffect, useState, useRef } from "react";

import c from "lib/common";
import Head from "components/head";
import Header from "components/header";
import MemberReducer from "lib/reducers/member";
import Vizualization from "components/visualization";
import MemberCollection from "lib/memberCollection";

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

  // only run once levels is ready
  useEffect(() => {
    const processActivities = ({ result }) => {
      const reducer = new MemberReducer();
      result.activities.forEach((activity) => {
        reducer.reduce(activity);
      });
      reducer.finalize();

      // the result contains members with OL numbers and love
      const rResult = reducer.getResult();

      const memberCollection = new MemberCollection();
      const membersCollectionRecords = Object.values(rResult).map(
        ({ actor, love, level, activityCount }) => ({
          id: actor.replace(/[^a-z0-9]/gi, ""),
          name: actor.split("#")[0],
          level,
          love,
          activityCount,
          reach: 0.5,
        })
      );
      memberCollection.list.push(...membersCollectionRecords);
      memberCollection.sort({ sort, levels });
      console.log(memberCollection.list);
      setMembers(memberCollection);
    };

    if (levels) {
      fetch("/api/activities")
        .then((res) => res.json())
        .then(processActivities);
    }
  }, [sort, levels]);

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
          />
        )}
      </div>
    </>
  );
}
