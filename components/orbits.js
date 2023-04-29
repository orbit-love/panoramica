import * as d3 from "d3";
import c from "lib/common";
import h from "lib/orbitHelper";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Selection from "components/selection";
import Controls from "components/controls";

export default function Orbits({ width, height, number, setNumber }) {
  const svgRef = useRef();
  const [selection, setSelection] = useState(null);
  const [animate, setAnimate] = useState(true);
  const prevNumber = c.usePrevious(number);
  const prevWidth = c.usePrevious(width);
  const prevHeight = c.usePrevious(height);

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
      });
      h.drawSun({ svgRef, width, height, selection, setSelection });
    },
    [svgRef, width, height, selection, setSelection, number]
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
  }, [width, height, selection]);

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
      <div className="flex absolute right-0 bottom-0 z-10 flex-col justify-start px-4 py-5 space-y-3 pointer-events-none">
        <Selection selection={selection} />
        <Controls
          animate={animate}
          setAnimate={setAnimate}
          number={number}
          setNumber={setNumber}
        />
      </div>
    </>
  );
}
