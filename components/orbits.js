import * as d3 from "d3";
import c from "lib/common";
import h from "lib/orbitHelper";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Selection from "components/selection";
import Controls from "components/controls";

export default function Orbits({ width, height, number, setNumber }) {
  // does the browser user prefer reduced motion?
  const isReduced =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  const svgRef = useRef();
  const [expanded, setExpanded] = useState(true);
  const [animate, setAnimate] = useState(!isReduced);
  const prevNumber = c.usePrevious(number);
  const prevWidth = c.usePrevious(width);
  const prevHeight = c.usePrevious(height);
  const [selection, _setSelection] = useState(null);
  const [bodies, setBodies] = useState([]);

  var setSelection = useCallback(
    function (value) {
      _setSelection(value);
      setExpanded(true);
    },
    [_setSelection]
  );

  const build = useCallback(
    function () {
      h.resetEverything({ svgRef, width, height, setSelection });
      h.drawOrbits({ svgRef, width, height, selection, setSelection });
      h.drawMembers({
        svgRef,
        width,
        height,
        selection,
        setSelection,
        number,
        bodies,
        setBodies,
      });
      h.drawSun({ svgRef, width, height, selection, setSelection, setBodies });
    },
    [svgRef, width, height, selection, setSelection, number, bodies, setBodies]
  );

  // rebuild if width, height, or number change
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (
      svg.selectAll("*").size() === 0 ||
      number !== prevNumber ||
      width !== prevWidth ||
      height != prevHeight
    ) {
      build();
    }
  }, [width, height, build, number, prevNumber, prevWidth, prevHeight]);

  // this is its own effect because it has to come after the simulation
  // so the sun in the back is on top of the planets
  useEffect(() => {
    h.drawOrbits({ svgRef, width, height, selection, setSelection });
    h.drawSun({ svgRef, width, height, selection, setSelection });
  }, [width, height, selection, setSelection]);

  // if the animation changes
  useEffect(() => {
    if (animate) {
      h.startAnimation({ svgRef });
    } else {
      h.stopAnimation({ svgRef });
    }
  }, [animate, number, width, height, prevNumber, prevWidth, prevHeight]);

  return (
    <>
      <div>
        <svg
          className="unselectable"
          ref={svgRef}
          style={{ width: "100%", height: "100%" }}
        ></svg>
      </div>
      <div className="flex absolute bottom-0 left-0 z-10 flex-col justify-start px-4 py-5 space-y-3 pointer-events-none">
        <Controls
          animate={animate}
          setAnimate={setAnimate}
          number={number}
          setNumber={setNumber}
        />
      </div>
      <div className="flex absolute right-0 bottom-0 z-10 flex-col justify-start px-4 py-5 space-y-3 pointer-events-none">
        <Selection
          svgRef={svgRef}
          selection={selection}
          setSelection={setSelection}
          bodies={bodies}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      </div>
    </>
  );
}
