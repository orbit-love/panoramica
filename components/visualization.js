import React, { useEffect, useRef, useState, useReducer } from "react";

import c from "lib/common";
import Shortcuts from "components/shortcuts";
import helper from "lib/visualization/helper";
import Widgets from "components/widgets";
import MemberGraph from "components/memberGraph";

export default function Visualization({
  width,
  height,
  fullscreen,
  setFullscreen,
}) {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  // does the browser user prefer reduced motion?
  const isReduced =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  // the default RPM of the orbits
  const { defaultRevolution, cycleDelay, firstCycleDelay } = c.visualization;

  // previous values for detecting changes
  const prevWidth = c.usePrevious(width);
  const prevHeight = c.usePrevious(height);

  const svgRef = useRef();

  const [levels, setLevels] = useState([]);

  const [community, setCommunity] = useState(null);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [sort, setSort] = useState("gravity");
  const [simulation, setSimulation] = useState(null);
  const [simulations, setSimulations] = useState([]);

  const [animate, setAnimate] = useState(!isReduced);
  const [cycle, setCycle] = useState(false);
  const [selection, setSelection] = useState(null);
  const [connection, setConnection] = useState(null);
  const [entity, setEntity] = useState(null);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [revolution, setRevolution] = useState(defaultRevolution);
  const [data, setData] = useState();
  const [graph, setGraph] = useState();

  // the activities for the running simulation and the focused range
  const prevShowNetwork = c.usePrevious(showNetwork);
  const prevSort = c.usePrevious(sort);
  const prevSimulation = c.usePrevious(simulation);

  // store the selection in a ref so we can access it in useEffect
  // that effect can't have selection as a dependency so we do it this way
  const selectionStateRef = useRef();
  selectionStateRef.current = selection;

  useEffect(() => {
    const eachCycle = () => {
      if (cycle && community?.members.length > 0) {
        var member = helper.getNextMember({
          selection: selectionStateRef.current,
          community,
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
    community,
    showNetwork,
    setSelection,
  ]);

  // rebuild if width, height change
  useEffect(() => {
    if (
      !levels ||
      width !== prevWidth ||
      height !== prevHeight ||
      simulation?.id !== prevSimulation?.id
    ) {
      // if major parameters have changed
      // clear the canvas and re-prepare the data
      console.log("Clearing canvas and rebuilding members");
      helper.resetEverything({ svgRef, width, height, setSelection, setCycle });
      const newLevels = helper.generateLevels({ width, height });
      setLevels(newLevels);
      return;
    }

    const props = {
      svgRef,
      width,
      height,
      selection,
      setSelection,
      community,
      setCommunity,
      setCycle,
      animate,
      levels,
      sort,
      prevSort,
      showNetwork,
      setShowNetwork,
      revolution,
      simulation,
    };

    // these are drawn in order of back to front
    helper.drawLevels(props);
    helper.drawSun(props);

    // draw members if available and start/stop animation
    if (community) {
      console.log(`Drawing ${community.members.length} members...`);
      helper.drawMembers(props);

      if (animate) {
        helper.startAnimation({ svgRef, levels, revolution });
      } else {
        helper.stopAnimation({ svgRef, levels });
      }
    }
  }, [
    width,
    height,
    prevWidth,
    prevHeight,
    community,
    setCommunity,
    selection,
    animate,
    levels,
    setLevels,
    showNetwork,
    prevShowNetwork,
    revolution,
    sort,
    prevSort,
    simulation,
    prevSimulation,
  ]);

  return (
    <div className="relative z-50" style={{ width, height }}>
      <Shortcuts
        community={community}
        setCommunity={setCommunity}
        selection={selection}
        setSelection={setSelection}
        fullscreen={fullscreen}
        setFullscreen={setFullscreen}
        animate={animate}
        setAnimate={setAnimate}
        cycle={cycle}
        setCycle={setCycle}
        showNetwork={showNetwork}
        setShowNetwork={setShowNetwork}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        levels={levels}
        revolution={revolution}
        setRevolution={setRevolution}
        showPanel={showPanel}
        setShowPanel={setShowPanel}
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
      {community && (
        <MemberGraph
          width={width}
          height={height}
          community={community}
          selection={selection}
          setSelection={setSelection}
          graph={graph}
          setGraph={setGraph}
          showNetwork={showNetwork}
          setShowNetwork={setShowNetwork}
          data={data}
          setData={setData}
          levels={levels}
          low={low}
          setLow={setLow}
          high={high}
          setHigh={setHigh}
          connection={connection}
          setConnection={setConnection}
        />
      )}
      <div className="hidden bg-[#0F0A25] bg-[#150D33] text-[#eef2ff] text-[#1D1640]" />
      <Widgets
        svgRef={svgRef}
        community={community}
        setCommunity={setCommunity}
        selection={selection}
        setSelection={setSelection}
        fullscreen={fullscreen}
        setFullscreen={setFullscreen}
        animate={animate}
        setAnimate={setAnimate}
        cycle={cycle}
        setCycle={setCycle}
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
        simulation={simulation}
        setSimulation={setSimulation}
        simulations={simulations}
        setSimulations={setSimulations}
        showPanel={showPanel}
        setShowPanel={setShowPanel}
        low={low}
        setLow={setLow}
        high={high}
        setHigh={setHigh}
        connection={connection}
        setConnection={setConnection}
        entity={entity}
        setEntity={setEntity}
      />
    </div>
  );
}
