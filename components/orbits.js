import c from "lib/common";
import helper from "lib/orbitHelper";
import React, { useEffect, useRef, useState } from "react";
import Selection from "components/selection";
import Controls from "components/controls";
import Steps from "components/steps";

export default function Orbits({ width, height, number }) {
  // does the browser user prefer reduced motion?
  const isReduced =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  // change to make developing easier
  const firstStep = 1;

  const svgRef = useRef();
  const [expanded, setExpanded] = useState(true);
  const [animate, setAnimate] = useState(!isReduced);
  const [cycle, setCycle] = useState(true);
  const prevNumber = c.usePrevious(number);
  const prevWidth = c.usePrevious(width);
  const prevHeight = c.usePrevious(height);
  const [selection, setSelection] = useState(null);
  const [step, setStep] = useState(firstStep);
  const [members, setMembers] = useState(null);
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    const selectRandomMember = () => {
      if (cycle && members?.length() > 0) {
        const items = members.list;
        const member = items[Math.floor(Math.random() * items.length)];
        // members.changeLevel({
        //   id: member.id,
        //   levelNumber: Math.max(member.level.number - 1, 1),
        //   love: member.love,
        //   reach: member.reach,
        // });
        setSelection(member);
      }
    };
    const cycleInterval = setInterval(selectRandomMember, 3000);
    // wait a little bit (but not 3 seconds) so the user can see the cycling
    // is happening on page load or when they manually enable cycling
    setTimeout(selectRandomMember, 750);
    return () => {
      clearInterval(cycleInterval);
    };
  }, [cycle, setCycle, members, setSelection]);

  // rebuild if width, height, or number change
  useEffect(() => {
    if (!members) {
      // set the members, triggering a render and another round of hooks
      console.log("Generating members and preparing canvas...");
      const newLevels = helper.generateLevels({ width, height });
      setLevels(newLevels);
      setMembers(
        helper.generateMembers({ levels: newLevels, advocateCount: number })
      );
      helper.resetEverything({ svgRef, width, height, setSelection });
    } else if (
      number !== prevNumber ||
      width !== prevWidth ||
      height !== prevHeight
    ) {
      // if major parameters have changed
      // clear the canvas and re-prepare the data
      console.log("Change detected, clearing canvas and rebuilding members");
      helper.resetEverything({ svgRef, width, height, setSelection });
      const newLevels = helper.generateLevels({ width, height });
      setLevels(newLevels);
      setMembers(
        helper.generateMembers({ levels: newLevels, advocateCount: number })
      );
    }
    // the next hook will pick up here to draw the objects
  }, [width, height, number, prevNumber, prevWidth, prevHeight, members]);

  // when selection or steps change, run this; data should be recomputed first
  useEffect(() => {
    if (!members) {
      return;
    }
    console.log(`Drawing ${members.length()} members...`);
    // these are drawn in order of back to front
    helper.drawLevels({
      svgRef,
      selection,
      setSelection,
      step,
      setStep,
      levels,
    });
    helper.drawMembers({
      svgRef,
      selection,
      setSelection,
      number,
      members,
      setMembers,
      animate,
      setCycle,
    });
    helper.drawSun({
      svgRef,
      width,
      height,
      selection,
      setSelection,
      step,
      setStep,
      levels,
    });
  }, [
    width,
    height,
    selection,
    setSelection,
    step,
    setStep,
    number,
    members,
    levels,
    animate,
  ]);

  // if the animation changes
  useEffect(() => {
    if (animate) {
      helper.startAnimation({ svgRef });
    } else {
      helper.stopAnimation({ svgRef });
    }
  }, [animate, number, width, height, prevNumber, prevWidth, prevHeight]);

  const flexClass = expanded ? "flex-col" : "";
  return (
    <>
      <div>
        <svg
          className="unselectable"
          ref={svgRef}
          style={{ width: "100%", height: "100%" }}
        ></svg>
      </div>
      <div
        className={`${flexClass} flex absolute bottom-0 left-0 z-10 justify-start items-start px-4 py-5 pointer-events-none`}
      >
        {members && (
          <Steps
            svgRef={svgRef}
            selection={selection}
            setSelection={setSelection}
            members={members}
            setMembers={setMembers}
            expanded={expanded}
            setExpanded={setExpanded}
            step={step}
            setStep={setStep}
            setCycle={setCycle}
          />
        )}
        <Controls
          animate={animate}
          setAnimate={setAnimate}
          cycle={cycle}
          setCycle={setCycle}
        />
      </div>
      <div className="flex absolute right-0 bottom-0 z-10 flex-col justify-start px-4 py-5 space-y-3 pointer-events-none">
        {selection && (
          <Selection
            svgRef={svgRef}
            selection={selection}
            setSelection={setSelection}
            members={members}
            step={step}
            setStep={setStep}
          />
        )}
      </div>
    </>
  );
}
