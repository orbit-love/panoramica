import React, { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

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

  // the default RPM of the orbits
  const defaultRevolution = 130000;
  const revolutionStep = 40000;
  const minRevolution = 10000;

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
  const [showInfo, setShowInfo] = useState(false);
  const [revolution, setRevolution] = useState(defaultRevolution);
  const [sort, setSort] = useState("gravity");

  const prevShowNetwork = c.usePrevious(showNetwork);
  const prevSort = c.usePrevious(sort);

  // store the selection in a ref so we can access it in useEffect
  // that effect can't have selection as a dependency so we do it this way
  const selectionStateRef = useRef();
  selectionStateRef.current = selection;

  const setSelectionAndFocusItem = (member, graph, showNetwork) => {
    setSelection(member);
    if (showNetwork) {
      const node = graph.findById(member.id);
      graph.focusItem(node, true);
    }
  };

  useHotkeys(
    "right",
    () =>
      setSelectionAndFocusItem(
        helper.getNextMember({ selection, members }),
        graph,
        showNetwork
      ),
    [selection, members, graph, showNetwork]
  );

  useHotkeys(
    "left",
    () =>
      setSelectionAndFocusItem(
        helper.getPreviousMember({ selection, members }),
        graph,
        showNetwork
      ),
    [selection, members, graph, showNetwork]
  );

  useHotkeys("a", () => setAnimate(!animate), [animate, setAnimate]);
  useHotkeys(
    "s",
    () => {
      var newRevolution = revolution - revolutionStep;
      if (newRevolution < minRevolution) newRevolution = defaultRevolution;
      helper.changeTransitionSpeed({ members, revolution: newRevolution });
      setRevolution(newRevolution);
    },
    [revolution, setRevolution, svgRef, members]
  );
  useHotkeys("c", () => setCycle(!cycle), [cycle, setCycle]);
  useHotkeys("n", () => setShowNetwork(!showNetwork), [
    showNetwork,
    setShowNetwork,
  ]);
  useHotkeys("escape", () => setShowNetwork(false), [setShowNetwork]);
  useHotkeys(
    "i",
    () => {
      setShowInfo(!showInfo);
      !showInfo && setExpanded(false);
    },
    [showInfo, setShowInfo]
  );
  useHotkeys(
    "f",
    () => {
      if (fullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().then(() => {
            setFullscreen(false);
          });
        }
      } else {
        if (!document.fullscreenElement) {
          document.body.requestFullscreen().then(() => {
            if (document.fullscreenElement) setFullscreen(true);
          });
        }
      }
    },
    [fullscreen, setFullscreen]
  );

  useEffect(() => {
    const eachCycle = () => {
      if (cycle && members?.length() > 0) {
        var member = helper.getNextMember({
          selection: selectionStateRef.current,
          members,
        });
        setSelectionAndFocusItem(member, graph, showNetwork);
      }
    };
    const cycleInterval = setInterval(eachCycle, 2000);
    // wait a little bit (but not 2 seconds) so the user can see the cycling
    // is happening on page load or when they manually enable cycling
    const timeout = setTimeout(eachCycle, 500);
    return () => {
      clearInterval(cycleInterval);
      clearTimeout(timeout);
    };
  }, [cycle, setCycle, members, graph, showNetwork, setSelection]);

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
  ]);

  return (
    <div className="relative" style={{ width, height }}>
      <div>
        <svg
          className="select-none"
          ref={svgRef}
          style={{ width, height }}
        ></svg>
      </div>
      {members && (
        <MemberGraph
          members={members}
          selection={selection}
          setSelection={setSelection}
          width={width}
          prevWidth={prevWidth}
          height={height}
          prevHeight={prevHeight}
          graph={graph}
          setGraph={setGraph}
          showNetwork={showNetwork}
          setShowNetwork={setShowNetwork}
        />
      )}
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
        graph={graph}
        sort={sort}
        setSort={setSort}
      />
    </div>
  );
}
