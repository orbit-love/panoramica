import React, { useEffect, useRef, useState } from "react";

import c from "lib/common";
import MemberGraph from "components/memberGraph";
import helper from "lib/visualization/helper";
import Widgets from "components/widgets";

export default function Visualization({
  width,
  height,
  number,
  fullscreen,
  setFullscreen,
  scrollToIntroduction,
}) {
  // does the browser user prefer reduced motion?
  const isReduced =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  // change to make developing easier
  const firstStep = 1;

  // previous values for detecting changes
  const prevNumber = c.usePrevious(number);
  const prevWidth = c.usePrevious(width);
  const prevHeight = c.usePrevious(height);

  const svgRef = useRef();
  const [animate, setAnimate] = useState(!isReduced);
  const [cycle, setCycle] = useState(false);
  const [selection, setSelection] = useState(null);
  const [step, setStep] = useState(firstStep);
  const [members, setMembers] = useState(null);
  const [levels, setLevels] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [showNetwork, setShowNetwork] = useState(false);
  const [graph, setGraph] = useState(null);

  const prevShowNetwork = c.usePrevious(showNetwork);

  useEffect(() => {
    const selectRandomMember = () => {
      if (cycle && !showNetwork && members?.length() > 0) {
        const items = members.list;
        const member = items[Math.floor(Math.random() * items.length)];
        setSelection(member);
      }
    };
    const cycleInterval = setInterval(selectRandomMember, 3000);
    // wait a little bit (but not 3 seconds) so the user can see the cycling
    // is happening on page load or when they manually enable cycling
    const timeout = setTimeout(selectRandomMember, 750);
    return () => {
      clearInterval(cycleInterval);
      clearTimeout(timeout);
    };
  }, [cycle, setCycle, members, showNetwork, setSelection]);

  // rebuild if width, height, or number change
  useEffect(() => {
    if (
      !members ||
      number !== prevNumber ||
      width !== prevWidth ||
      height !== prevHeight
    ) {
      // if major parameters have changed
      // clear the canvas and re-prepare the data
      console.log("Clearing canvas and rebuilding members");
      helper.resetEverything({ svgRef, width, height, setSelection, setCycle });
      const newLevels = helper.generateLevels({ width, height });
      setLevels(newLevels);
      setMembers(
        helper.generateMembers({ levels: newLevels, advocateCount: number })
      );
      return;
    }

    // no need to do other prep
    if (showNetwork) {
      return;
    }

    // if the network switch happened, the svg needs to be prepared again
    if (showNetwork !== prevShowNetwork) {
      helper.resetEverything({ svgRef, width, height, setSelection, setCycle });
    }

    console.log(`Drawing ${members.length()} members...`);

    const props = {
      svgRef,
      width,
      height,
      selection,
      setSelection,
      number,
      members,
      setMembers,
      setCycle,
      animate,
      step,
      setStep,
      levels,
      expanded,
      setExpanded,
    };

    // these are drawn in order of back to front
    helper.drawLevels(props);
    helper.drawMembers(props);
    helper.drawSun(props);

    if (animate) {
      helper.startAnimation({ svgRef });
    } else {
      helper.stopAnimation({ svgRef });
    }
  }, [
    width,
    height,
    number,
    prevNumber,
    prevWidth,
    prevHeight,
    members,
    selection,
    step,
    animate,
    levels,
    expanded,
    setExpanded,
    showNetwork,
    prevShowNetwork,
  ]);

  return (
    <>
      {!showNetwork && (
        <div>
          <svg
            className="unselectable"
            ref={svgRef}
            style={{ width: "100%", height: "100%" }}
          ></svg>
        </div>
      )}
      {showNetwork && members && (
        <MemberGraph
          members={members}
          selection={selection}
          setSelection={setSelection}
          width={width}
          height={height}
          prevWidth={prevWidth}
          prevHeight={prevHeight}
          graph={graph}
          setGraph={setGraph}
        />
      )}
      <div className="hidden bg-[#0F0A25] text-[#eef2ff] text-[#1D1640]" />
      <Widgets
        svgRef={svgRef}
        members={members}
        setMembers={setMembers}
        step={step}
        setStep={setStep}
        selection={selection}
        setSelection={setSelection}
        fullscreen={fullscreen}
        setFullscreen={setFullscreen}
        animate={animate}
        setAnimate={setAnimate}
        cycle={cycle}
        setCycle={setCycle}
        expanded={expanded}
        setExpanded={setExpanded}
        scrollToIntroduction={scrollToIntroduction}
        showNetwork={showNetwork}
        setShowNetwork={setShowNetwork}
        graph={graph}
      />
    </>
  );
}
