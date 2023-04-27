import * as d3 from "d3";
import c from "components/2023/common";
import React, { useEffect, useRef, useState, useCallback } from "react";
import levelsData from "data/levels";
import Simulation from "components/2023/simulation";
import Selection from "components/2023/selection";
import Controls from "components/2023/controls";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}

function rxFactory(width) {
  return d3
    .scalePow()
    .exponent(0.7)
    .range([0, width / 2 - 100])
    .domain([5, 100]);
}

// create a scale for the orbit y radius
function ryFactory(height) {
  return d3
    .scalePow()
    .exponent(1)
    .range([0, height / 2.5])
    .domain([0, 100]);
}

function cxFactory(width) {
  return width / 2;
}
function cyFactory(height) {
  return height / 2 - 90;
}

function orbitsFactory(width, height) {
  // create a scale for the orbit x radius
  const rx = rxFactory(width);
  // create a scale for the orbit y radius
  const ry = ryFactory(height);
  // the center where each orbit ellipse is placed
  const cx = cxFactory(width);
  const cy = cyFactory(height);

  // tighten up the orbits at the top
  const yOffset = d3.scalePow().exponent(1.0).range([0, 100]).domain([1, 100]);
  // how fast bodies move in orbit
  const revolution = d3
    .scalePow()
    .exponent(2)
    .range([100000, 600000])
    .domain([1, 100]);

  // Define the orbits
  return levelsData.map(({ name, distance, description }, i) => ({
    i,
    cx,
    name,
    distance,
    description,
    cy: cy + yOffset(distance),
    rx: rx(distance),
    ry: ry(distance),
    revolution: revolution(distance),
  }));
}

function clearSelection(svg) {
  svg.selectAll(".show-me").attr("visibility", "hidden");
}

function resetEverything({ svgRef, width, height, setSelection }) {
  const svg = d3.select(svgRef.current);
  // remove everything in there
  svg.selectAll("*").remove();
  // set the attributes
  svg.attr("width", width).attr("height", height);
  // when the svg is clicked, reset the selection
  // todo don't rebind
  svg.on("click", function () {
    clearSelection(svg);
    setSelection(null);
  });
}

function drawOrbits({ svgRef, width, height, selection, setSelection }) {
  const svg = d3.select(svgRef.current);
  const ry = ryFactory(height);

  const cx = cxFactory(width);
  const cy = cyFactory(height);

  // constants that don't depend on width and height
  const ringOpacity = 0.6;

  // get the orbits
  const orbits = orbitsFactory(width, height);

  // put orbit level labels
  svg
    .selectAll("text.orbit-label")
    .data(orbits)
    .join("text")
    .attr("class", "orbit-label clickable")
    .attr("text-anchor", "middle")
    .attr("x", (d) => d.cx)
    .attr("y", (d) => d.cy + d.ry + 24)
    .attr("font-size", 16)
    .attr("font-weight", 400)
    .attr("fill", (d) =>
      selection && selection.name === d.name ? c.selectedColor : c.neutralColor
    )
    .text((d) => d.name)
    .on("click", (e, d) => {
      e.stopPropagation();
      clearSelection(svg);
      setSelection(d);
    });

  // draw the orbits
  svg
    .selectAll("ellipse")
    .data(orbits)
    .join("ellipse")
    .attr("stroke", (d) =>
      selection && selection.name === d.name ? c.selectedColor : c.neutralColor
    )
    .attr("fill", "none")
    .attr("rx", (d) => d.rx)
    .attr("ry", (d) => d.ry)
    .attr("cx", (d) => d.cx)
    .attr("cy", (d) => d.cy)
    .attr("stroke-opacity", ringOpacity - 0.3)
    .attr("stroke-width", 2);

  // orbit level 1
  const o1 = levelsData[0].distance;

  // set the size of the sun
  const sunRadius = ry(o1) - 30;
  const sunColor = c.whiteColor;
  const strokeColor = c.backgroundColor;
  const sunCy = cy + 10;

  // add a clip path
  svg
    .selectAll("#clip-path-1")
    .data([1])
    .join("clipPath")
    .attr("id", "clip-path-1")
    .append("rect")
    .attr("x", cx - sunRadius)
    .attr("y", sunCy - sunRadius - 5) // for the stroke on the circle
    .attr("width", sunRadius * 2)
    .attr("height", sunRadius);

  // draw the sun
  svg
    .selectAll("circle.sun")
    .data([1])
    .join("circle")
    .attr("class", "sun clickable")
    .attr("stroke", strokeColor)
    .attr("fill", (_) =>
      selection && selection.name === "Mission" ? c.selectedColor : sunColor
    )
    .attr("stroke-width", 5)
    .attr("r", sunRadius)
    .attr("cx", cx)
    .attr("cy", sunCy)
    .on("click", (e) => {
      e.stopPropagation();
      clearSelection(svg);
      setSelection({ name: "Mission" });
    });
}

function drawSun({ svgRef, width, height, selection, setSelection }) {
  const svg = d3.select(svgRef.current);
  const ry = ryFactory(height);
  const cx = cxFactory(width);
  const cy = cyFactory(height);
  const o1 = levelsData[0].distance;
  const sunRadius = ry(o1) - 30;
  const sunColor = c.whiteColor;
  const strokeColor = c.backgroundColor;
  const sunCy = cy + 10;
  // draw a clipped circle to cover the back of the ring
  svg
    .selectAll("circle.sun-clip")
    .data([1])
    .join("circle")
    .attr("class", "sun-clip clickable")
    .attr("fill", (_) =>
      selection && selection.name === "Mission" ? c.selectedColor : sunColor
    )
    .attr("stroke", strokeColor)
    .attr("stroke-width", 5)
    .attr("r", sunRadius)
    .attr("cx", cx)
    .attr("cy", sunCy)
    .attr("clip-path", "url(#clip-path-1)")
    .on("click", (e) => {
      e.stopPropagation();
      clearSelection(svg);
      setSelection({ name: "Mission" });
    });

  // draw the text on the circle
  const text = svg
    .selectAll("text.circle-text")
    .data([1])
    .join("text")
    .attr("class", "circle-text pointer-events-none")
    .attr("x", cx)
    .attr("y", sunCy - 5) // push it down so it is in the middle of the circle
    .attr("fill", strokeColor)
    .attr("text-anchor", "middle")
    .attr("font-weight", 600);

  text
    .selectAll("tspan")
    .data([1])
    .join("tspan")
    .text("Mission")
    .attr("dy", 10);
}

function runSimulation({
  svgRef,
  width,
  height,
  selection,
  setSelection,
  number,
  animate,
}) {
  const svg = d3.select(svgRef.current);
  const orbits = orbitsFactory(width, height);
  // Add the bodies
  Simulation({ svg, orbits, selection, setSelection, number, animate });
}

export default function Orbits({ width, height, number, setNumber }) {
  const svgRef = useRef();
  const [selection, setSelection] = useState(null);
  const [animate, setAnimate] = useState(true);
  const prevNumber = usePrevious(number);
  const prevWidth = usePrevious(width);
  const prevHeight = usePrevious(height);

  const build = useCallback(
    function () {
      resetEverything({ svgRef, width, height, setSelection });
      drawOrbits({ svgRef, width, height, selection, setSelection });
      runSimulation({
        svgRef,
        width,
        height,
        selection,
        setSelection,
        number,
        animate,
      });
      drawSun({ svgRef, width, height, selection, setSelection });
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

  // useEffect(() => {
  //   // don't do anything until width and height are established
  //   if (!width || !height) {
  //     return;
  //   }
  //   drawOrbits({ svgRef, width, height, selection, setSelection });
  // }, [width, height, selection, setSelection]);

  // draw the simulation last so that the bodies are on top
  // useEffect(() => {
  //   // don't do anything if width and height aren't specified yet
  //   if (!width || !height || !number) {
  //     return;
  //   }

  //   runSimulation({
  //     svgRef,
  //     width,
  //     height,
  //     selection,
  //     setSelection,
  //     number,
  //     animate,
  //   });
  // }, [width, height, animate]);

  // this is its own effect because it has to come after the simulation
  // so the sun in the back is on top of the planets
  useEffect(() => {
    drawOrbits({ svgRef, width, height, selection, setSelection });
    drawSun({ svgRef, width, height, selection, setSelection });
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
      <div className="flex absolute right-0 bottom-0 z-10 flex-col justify-start px-4 py-5 space-y-6 pointer-events-none">
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
