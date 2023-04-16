import * as d3 from "d3";
import c from "components/2023/common";
import React, { useEffect, useRef, useState } from "react";
import levelsData from "data/levels";
import Simulation from "components/2023/simulation";
import Selection from "components/2023/selection";

export default function Orbits({ width, height }) {
  const svgRef = useRef();
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    // don't do anything until width and height are established
    if (!width || !height) {
      return;
    }
    const svg = d3.select(svgRef.current);
    // short circuit, comment out when developing
    // this also breaks resize
    if (svg.selectAll("*").size() > 0) {
      return;
    }
    // remove everything in there
    svg.selectAll("*").remove();

    // set the attributes
    svg.attr("width", width).attr("height", height);

    // when the svg is clicked, reset the selection
    svg.on("click", () => setSelection(null));

    // create a scale for the orbit x radius
    const rx = d3
      .scalePow()
      .exponent(0.7)
      .range([0, width / 2 - 100])
      .domain([5, 100]);

    // create a scale for the orbit y radius
    const ry = d3
      .scalePow()
      .exponent(1)
      .range([0, height / 3])
      .domain([0, 100]);

    // tighten up the orbits at the top
    const yOffset = d3
      .scalePow()
      .exponent(1.0)
      .range([0, 100])
      .domain([1, 100]);

    const ringOpacity = 0.7;
    const revolution = d3.scaleLinear().range([70000, 280000]).domain([1, 100]);

    // orbit level 1
    const o1 = levelsData[0].distance;

    // the center where each orbit ellipse is placed
    const cx = width / 2;
    const cy = height / 2 - 90;

    // Define the orbits
    const orbits = levelsData.map(({ name, distance }, i) => ({
      i,
      cx,
      name,
      distance,
      cy: cy + yOffset(distance),
      rx: rx(distance),
      ry: ry(distance),
      revolution: revolution(distance),
    }));

    // set the size of the sun
    const sunRadius = ry(o1) - 20;
    const sunColor = c.whiteColor;
    const strokeColor = c.backgroundColor;
    const sunCy = cy + 10;

    // put orbit level labels
    svg
      .selectAll("text.orbit-label")
      .data(orbits)
      .join("text")
      .attr("class", "orbit-label clickable")
      .attr("text-anchor", "middle")
      .attr("x", (d) => d.cx)
      .attr("y", (d) => d.cy + d.ry + 30)
      .attr("font-size", 16)
      .attr("font-weight", 500)
      .attr("opacity", ringOpacity)
      .attr("fill", c.neutralColor)
      .text((d) => d.name)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", ringOpacity);
      })
      .on("click", (e, d) => {
        e.stopPropagation();
        setSelection(d);
      });

    // draw the orbits
    svg
      .selectAll("ellipse")
      .data(orbits)
      .join("ellipse")
      .attr("stroke", c.neutralColor)
      .attr("fill", "none")
      .attr("rx", (d) => d.rx)
      .attr("ry", (d) => d.ry)
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("stroke-opacity", ringOpacity - 0.3)
      .attr("stroke-width", 2);

    // Add the bodies
    Simulation({ svg, orbits, selection, setSelection });

    // add a clip path
    svg
      .append("clipPath")
      .attr("id", "clip-path-1")
      .append("rect")
      .attr("x", cx - sunRadius)
      .attr("y", sunCy - sunRadius - 5) // for the stroke on the circle
      .attr("width", sunRadius * 2)
      .attr("height", sunRadius);

    // draw the sun
    svg
      .append("circle")
      .attr("class", "clickable")
      .attr("fill", sunColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy)
      .on("click", (e) => {
        e.stopPropagation();
        setSelection({ name: "Mission" });
      });

    // draw a clipped circle to cover the back of the ring
    svg
      .append("circle")
      .attr("class", "clickable")
      .attr("fill", sunColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy)
      .attr("clip-path", "url(#clip-path-1)")
      .on("click", (e) => {
        e.stopPropagation();
        setSelection({ name: "Mission" });
      });

    // draw the text on the circle
    const text = svg
      .append("text")
      .attr("class", "pointer-events-none")
      .attr("x", cx)
      .attr("y", sunCy - 5) // push it down so it is in the middle of the circle
      .attr("fill", strokeColor)
      .attr("text-anchor", "middle")
      .attr("font-weight", 600);

    text.append("tspan").text("Mission").attr("dy", 10);
    // text.append("tspan").attr("dx", -70).attr("dy", 20).text("Mission");
  }, [width, height]);

  return (
    <>
      <div>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
      </div>
      <Selection selection={selection} />
    </>
  );
}
