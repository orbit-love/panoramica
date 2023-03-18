import c from "components/2023/common";
import Community from "components/2023/community";
import Member from "components/2023/member";
import TimeControl from "components/2023/time_control";
import * as d3 from "d3";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

    const rx = d3
      .scaleLinear()
      .range([0, width / 2 - 30])
      .domain([1, 100]);

    const ry = d3
      .scaleLinear()
      .range([0, height / 3 - 30])
      .domain([1, 100]);

    const [o1, o2, o3, o4] = [20, 45, 70, 95];

    const cx = width / 2;
    const cy = height / 2;

    // Define the orbits
    const orbits = [
      { o: o1, rx: rx(o1), ry: ry(o1), cx, cy },
      { o: o2, rx: rx(o2), ry: ry(o2), cx, cy },
      { o: o3, rx: rx(o3), ry: ry(o3), cx, cy },
      { o: o4, rx: rx(o4), ry: ry(o4), cx, cy },
    ];

    // Define the planets
    const planets = orbits.map((orbit, index) => {
      return {
        id: index,
        r: 10,
        cx: orbit.cx + orbit.rx,
        cy: orbit.cy,
      };
    });

    const sunRadius = rx(o1) / 2;

    // add a clip path
    svg
      .append("clipPath")
      .attr("id", "clip-path-1")
      .append("rect")
      .attr("x", cx - sunRadius)
      .attr("y", cy - sunRadius)
      .attr("width", sunRadius * 2)
      .attr("height", sunRadius);

    // draw the yellow circle
    svg
      .append("circle")
      .attr("fill", "yellow")
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", cy);

    // draw the orbits
    svg
      .selectAll("ellipse")
      .data(orbits)
      .join("ellipse")
      .attr("stroke", "#ddd")
      .attr("fill", "none")
      .attr("rx", (d) => d.rx)
      .attr("ry", (d) => d.ry)
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("stroke-width", 2);

    // draw the yellow circle
    svg
      .append("circle")
      .attr("fill", "yellow")
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("clip-path", "url(#clip-path-1)");
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
