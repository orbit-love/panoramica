import * as d3 from "d3";
import c from "lib/common";
import helper from "lib/orbitHelper";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Selection from "components/selection";
import Controls from "components/controls";
import Steps from "components/steps";

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
  const [selection, setSelection] = useState(null);
  const [step, setStep] = useState(1);
  const [bodies, setBodies] = useState([]);

  // rebuild if width, height, or number change
  useEffect(() => {
    if (bodies.length === 0) {
      // set the bodies, triggering a render and another round of hooks
      console.log("Generating bodies and preparing canvas...");
      setBodies(helper.generateBodies({ width, height, number }));
      helper.resetEverything({ svgRef, width, height, setSelection });
    } else if (
      number !== prevNumber ||
      width !== prevWidth ||
      height !== prevHeight
    ) {
      // if major parameters have changed
      // clear the canvas and re-prepare the data
      console.log("Change detected, clearing canvas and rebuilding bodies");
      helper.resetEverything({ svgRef, width, height, setSelection });
      setBodies(helper.generateBodies({ width, height, number }));
    }
    // the next hook will pick up here to draw the objects
  }, [width, height, number, prevNumber, prevWidth, prevHeight, bodies]);

  // when selection or steps change, run this; data should be recomputed first
  useEffect(() => {
    if (bodies.length === 0) {
      return;
    }
    console.log(`Drawing ${bodies.length} bodies...`);
    // these are drawn in order of back to front
    helper.drawOrbits({
      svgRef,
      width,
      height,
      selection,
      setSelection,
      step,
      setStep,
    });
    helper.drawMembers({
      svgRef,
      width,
      height,
      selection,
      setSelection,
      number,
      bodies,
      setBodies,
    });
    helper.drawSun({
      svgRef,
      width,
      height,
      selection,
      setSelection,
      step,
      setStep,
    });
  }, [width, height, selection, setSelection, step, setStep, number, bodies]);

  // if the animation changes
  useEffect(() => {
    if (animate) {
      helper.startAnimation({ svgRef });
    } else {
      helper.stopAnimation({ svgRef });
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
        {selection && (
          <Selection
            svgRef={svgRef}
            selection={selection}
            setSelection={setSelection}
            bodies={bodies}
            step={step}
            setStep={setStep}
          />
        )}
        <Steps
          svgRef={svgRef}
          selection={selection}
          setSelection={setSelection}
          bodies={bodies}
          expanded={expanded}
          setExpanded={setExpanded}
          step={step}
          setStep={setStep}
        />
      </div>
    </>
  );
}
