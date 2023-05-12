import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import helper from "lib/orbitHelper";
import Controls from "components/controls";
import Steps from "components/steps";
import Member from "content/cards/member";

export default function Orbits({
  width,
  height,
  number,
  fullscreen,
  setFullscreen,
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
  const [expanded, setExpanded] = useState(true);
  const [animate, setAnimate] = useState(!isReduced);
  const [cycle, setCycle] = useState(true);
  const [selection, setSelection] = useState(null);
  const [step, setStep] = useState(firstStep);
  const [members, setMembers] = useState(null);
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    const selectRandomMember = () => {
      if (cycle && members?.length() > 0) {
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
  }, [cycle, setCycle, members, setSelection]);

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
      helper.resetEverything({ svgRef, width, height, setSelection });
      const newLevels = helper.generateLevels({ width, height });
      setLevels(newLevels);
      setMembers(
        helper.generateMembers({ levels: newLevels, advocateCount: number })
      );
      return;
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
  ]);

  const classes = `flex space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-70`;
  return (
    <>
      <div>
        <svg
          className="unselectable"
          ref={svgRef}
          style={{ width: "100%", height: "100%" }}
        ></svg>
      </div>
      <div className="hidden bg-[#0F0A25] text-[#eef2ff]" />
      <div
        className={`flex absolute bottom-0 left-0 z-10 flex-col px-4 py-5 space-y-4`}
      >
        {expanded && members && (
          <div className={`${classes} w-96`}>
            <Steps
              svgRef={svgRef}
              selection={selection}
              setSelection={setSelection}
              members={members}
              setMembers={setMembers}
              step={step}
              setStep={setStep}
              setCycle={setCycle}
            />
          </div>
        )}
        <div className="flex">
          <div className={`${classes} py-4 px-5 pointer-events-auto`}>
            {expanded && (
              <button onClick={() => setExpanded(false)} className="btn">
                <FontAwesomeIcon
                  icon="chevron-down"
                  className="text-lg"
                ></FontAwesomeIcon>
              </button>
            )}
            {!expanded && (
              <button onClick={() => setExpanded(true)} className="btn">
                <FontAwesomeIcon
                  icon="solar-system"
                  className="text-lg"
                ></FontAwesomeIcon>
              </button>
            )}
            <div className="border border-indigo-900" />
            <Controls
              animate={animate}
              setAnimate={setAnimate}
              cycle={cycle}
              setCycle={setCycle}
              fullscreen={fullscreen}
              setFullscreen={setFullscreen}
            />
          </div>
          <div className="mx-auto" />
        </div>
      </div>
      {selection && selection.level && (
        <div
          className={`absolute right-0 bottom-0 z-10 px-4 py-5 w-96 pointer-events-none`}
        >
          <div
            className={`${classes} flex relative flex-col px-7 py-8 pointer-events-auto`}
          >
            <Member selection={selection} />
          </div>
        </div>
      )}
    </>
  );
}
