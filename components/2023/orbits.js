import * as d3 from "d3";
import c from "components/2023/common";
import React, { useEffect, useRef } from "react";
import levelsData from "data/levels";
import Simulation from "components/2023/simulation";

export default function Orbits({ width, height }) {
  const svgRef = useRef();

  useEffect(() => {
    // don't do anything until width and height are established
    if (!width || !height) {
      return;
    }
    const svg = d3.select(svgRef.current);
    // short circuit, comment out when developing
    // this also breaks resize
    if (svg.selectAll("*").size() > 0) {
      // return;
    }
    // remove everything in there
    svg.selectAll("*").remove();

    // set the attributes
    svg.attr("width", width).attr("height", height);

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

    const ringOpacity = 0.8;
    const revolution = d3.scaleLinear().range([70000, 280000]).domain([1, 100]);
    const planetSize = d3.scaleLinear().range([21, 17]).domain([1, 100]);
    const fontSize = d3.scaleLinear().range([15, 12]).domain([1, 100]);
    const planetColor = d3
      .scaleLinear()
      .domain([0, 100])
      .range(["#F503EA", "#8F85FF"]);

    // orbit level 1
    const o1 = levelsData[0].size;

    // the center where each orbit ellipse is placed
    const cx = width / 2;
    const cy = height / 2 - 90;

    // Define the orbits
    const orbits = levelsData.map(({ name, size }, i) => ({
      i,
      cx,
      name,
      cy: cy + yOffset(size),
      rx: rx(size),
      ry: ry(size),
      revolution: revolution(size),
      planetSize: planetSize(size),
      planetColor: planetColor(size),
      fontSize: fontSize(size),
    }));

    // set the size of the sun
    const sunRadius = ry(o1);
    const sunColor = "#FCFDFE";
    const strokeColor = c.backgroundColor;
    const sunCy = cy + 10;

    // put orbit level labels
    svg
      .selectAll("text.orbit-label")
      .data(orbits)
      .join("text")
      .attr("class", "orbit-label")
      .attr("text-anchor", "middle")
      .attr("x", (d) => d.cx)
      .attr("y", (d) => d.cy + d.ry + 25)
      .attr("font-size", 16)
      .attr("font-weight", 500)
      .attr("opacity", ringOpacity)
      .attr("fill", (d) => d.planetColor)
      .text((d) => d.name);

    // draw the orbits
    svg
      .selectAll("ellipse")
      .data(orbits)
      .join("ellipse")
      .attr("stroke", (d) => d.planetColor)
      .attr("stroke-dasharray", 1)
      .attr("fill", "none")
      .attr("rx", (d) => d.rx)
      .attr("ry", (d) => d.ry)
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("stroke-opacity", ringOpacity)
      .attr("stroke-width", 3);

    // Add the bodies
    Simulation({ svg, orbits });

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
      .attr("fill", sunColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy);

    // draw a clipped yellow circle to cover the back of the ring
    svg
      .append("circle")
      .attr("fill", sunColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy)
      .attr("clip-path", "url(#clip-path-1)");

    // draw the text on the circle
    const text = svg
      .append("text")
      .attr("x", cx)
      .attr("y", sunCy - 5) // push it down so it is in the middle of the circle
      .attr("fill", strokeColor)
      .attr("text-anchor", "middle")
      .attr("font-weight", 600);

    text.append("tspan").text("Mission").attr("dy", 10);
    // text.append("tspan").attr("dx", -70).attr("dy", 20).text("Mission");
  });

  return <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>;
}
