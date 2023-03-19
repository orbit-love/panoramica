import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import Head from "components/head";

export default function Index() {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // remove everything in there
    svg.selectAll("*").remove();

    const width = window.innerWidth,
      height = window.innerHeight * 0.75;

    // set the attributes
    svg.attr("width", width).attr("height", height);

    // create a scale for the orbit x radius
    const rx = d3
      .scalePow()
      .exponent(0.9)
      .range([0, width / 2 - 50])
      .domain([1, 100]);

    // create a scale for the orbit y radius
    const ry = d3
      .scalePow()
      .exponent(1)
      .range([0, height / 3])
      .domain([1, 100]);

    const yOffset = d3.scalePow().exponent(2).range([0, 80]).domain([1, 100]);

    const rpm = d3.scaleLinear().range([8000, 10000]).domain([1, 100]);
    const planetSize = d3.scaleLinear().range([21, 7]).domain([1, 100]);
    const planetColor = d3
      .scaleLinear()
      .domain([1, 100])
      .range(["red", "blue"]);

    // create orbit level rings on a 1-100 scale
    const baseNumbers = [25, 50, 73, 95];
    const [o1] = baseNumbers;

    // the center where each orbit ellipse is placed
    const cx = width / 2;
    const cy = height / 2 - 90;

    // Define the orbits
    const orbits = baseNumbers.map((o) => ({
      o: o,
      cx,
      cy: cy + yOffset(o),
      rx: rx(o),
      ry: ry(o),
      rpm: rpm(o),
      planetSize: planetSize(o),
      planetColor: planetColor(o),
    }));

    // set the size of the sun
    const sunRadius = rx(o1) / 2.5;
    const sunColor = "orange";

    // add a clip path
    svg
      .append("clipPath")
      .attr("id", "clip-path-1")
      .append("rect")
      .attr("x", cx - sunRadius)
      .attr("y", cy - sunRadius - 5) // for the stroke on the circle
      .attr("width", sunRadius * 2)
      .attr("height", sunRadius);

    // draw the sun
    svg
      .append("circle")
      .attr("fill", sunColor)
      .attr("stroke", "black")
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", cy);

    // draw the orbits
    svg
      .selectAll("ellipse")
      .data(orbits)
      .join("ellipse")
      .attr("stroke", (d) => d.planetColor)
      .attr("fill", "none")
      .attr("rx", (d) => d.rx)
      .attr("ry", (d) => d.ry)
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("stroke-width", 2);

    // Create a group to put the planets in
    const planetGroup = svg
      .selectAll("g.planet-group")
      .data(orbits)
      .enter()
      .append("g")
      .attr("class", "planet-group");

    // Draw a circle for each planet
    planetGroup
      .append("circle")
      .attr("r", (d) => d.planetSize)
      .attr("fill", (d) => d.planetColor);

    // Animate the planets
    planetGroup.each(function (orbit) {
      // Create an elliptical path using the SVG path A command
      const pathData = `M ${orbit.cx - orbit.rx},${orbit.cy}
        a ${orbit.rx} ${orbit.ry} 0 1 1 ${orbit.rx * 2},0,
        a ${orbit.rx} ${orbit.ry} 0 1 1 ${orbit.rx * -2},0`;

      const pathNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathNode.setAttribute("d", pathData);

      function transition(selection) {
        d3.select(selection)
          .transition()
          .duration(orbit.rpm)
          .ease(d3.easeLinear)
          .attrTween("transform", () => {
            const pathLength = pathNode.getTotalLength();
            return function (t) {
              const point = pathNode.getPointAtLength(t * pathLength);
              return `translate(${point.x}, ${point.y})`;
            };
          })
          .on("end", () => transition(selection));
      }
      transition(this);
    });

    // draw a clipped yellow circle to cover the back of the ring
    svg
      .append("circle")
      .attr("fill", sunColor)
      .attr("stroke", "black")
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("clip-path", "url(#clip-path-1)");

    // draw the text on the circle
    svg
      .append("text")
      .attr("x", cx)
      .attr("y", cy + 3) // push it down so it is in the middle of the circle
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-weight", "500")
      .text("Mission");
  });

  return (
    <div id="outer-container" className="flex flex-col w-full">
      <Head />
      <div id="container" className="bg-[#0F0A25]">
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }}>
          <g></g>
        </svg>
      </div>
      <div className="p-24 text-center">There will be content here.</div>
    </div>
  );
}
