import * as d3 from "d3";
import c from "components/2023/common";
import h from "components/2023/orbitHelper";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Selection from "components/2023/selection";
import Controls from "components/2023/controls";

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
      h.runSimulation({
        svgRef,
        width,
        height,
        selection,
        setSelection,
        number,
        animate,
      });
      h.drawSun({ svgRef, width, height, selection, setSelection });
    },
    [svgRef, width, height, selection, setSelection, animate, number]
  );

  const onPlay = function () {
    setAnimate(true);
  };
  const onPause = function () {
    setAnimate(false);
  };
  const onChangeSize = function () {
    setNumber(this);
  };

  // rebuild if width, height, number, or selection change
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
          onPlay={onPlay}
          onPause={onPause}
          onChangeSize={onChangeSize}
        />
      </div>
    </>
  );
}
