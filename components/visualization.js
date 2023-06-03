import React, { useEffect, useRef, useState, useReducer } from "react";

import c from "lib/common";
import Shortcuts from "components/shortcuts";
import helper from "lib/visualization/helper";
import Widgets from "components/widgets";

export default function Visualization({
  width,
  height,
  number,
  fullscreen,
  setFullscreen,
  scrollToIntroduction,
  records,
}) {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  // does the browser user prefer reduced motion?
  const isReduced =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  // change to make developing easier
  const firstStep = 1;

  // the default RPM of the orbits
  const { defaultRevolution, defaultSort, cycleDelay, firstCycleDelay } =
    c.visualization;

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
  const [showNetwork, setShowNetwork] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [revolution, setRevolution] = useState(defaultRevolution);
  const [sort, setSort] = useState(defaultSort);
  const [data, setData] = useState();

  const prevShowNetwork = c.usePrevious(showNetwork);
  const prevSort = c.usePrevious(sort);

  // store the selection in a ref so we can access it in useEffect
  // that effect can't have selection as a dependency so we do it this way
  const selectionStateRef = useRef();
  selectionStateRef.current = selection;

  useEffect(() => {
    const eachCycle = () => {
      if (cycle && members?.length() > 0) {
        var member = helper.getNextMember({
          selection: selectionStateRef.current,
          members,
        });
        setSelection(member);
      }
    };
    const cycleInterval = setInterval(eachCycle, cycleDelay);
    // wait a little bit (but not 2 seconds) so the user can see the cycling
    // is happening on page load or when they manually enable cycling
    const timeout = setTimeout(eachCycle, firstCycleDelay);
    return () => {
      clearInterval(cycleInterval);
      clearTimeout(timeout);
    };
  }, [
    cycle,
    setCycle,
    cycleDelay,
    firstCycleDelay,
    members,
    showNetwork,
    setSelection,
  ]);

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
      const newMembers = helper.generateMembers({
        records,
        levels: newLevels,
        advocateCount: number,
      });
      console.log(newMembers);
      newMembers.prepareToRender({ sort });
      setMembers(newMembers);
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
      expanded,
      setExpanded,
      sort,
      prevSort,
      showNetwork,
      setShowNetwork,
      revolution,
    };

    // these are drawn in order of back to front
    helper.drawLevels(props);
    helper.drawMembers(props);
    helper.drawSun(props);

    if (animate) {
      helper.startAnimation({ svgRef, revolution });
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
    revolution,
    sort,
    prevSort,
    records,
  ]);

  return (
    <div className="relative" style={{ width, height }}>
      <Shortcuts
        members={members}
        setMembers={setMembers}
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
        showNetwork={showNetwork}
        setShowNetwork={setShowNetwork}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        levels={levels}
        revolution={revolution}
        setRevolution={setRevolution}
      />
      <div>
        <svg
          className="select-none"
          ref={svgRef}
          style={{
            width,
            height,
          }}
        ></svg>
      </div>
      <div className="hidden bg-[#0F0A25] bg-[#150D33] text-[#eef2ff] text-[#1D1640]" />
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
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        sort={sort}
        setSort={setSort}
        forceUpdate={forceUpdate}
        data={data}
        setData={setData}
        levels={levels}
      />
    </div>
  );
}
