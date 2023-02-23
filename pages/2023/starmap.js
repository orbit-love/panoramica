import c from "components/2023/common";
import Community from "components/2023/community";
import Member from "components/2023/member";
import TimeControl from "components/2023/time_control";
import * as d3 from "d3";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dataFile from "./data-mid.json";

import Head from "components/head";

export default function Starmap() {
  const svgRef = useRef();

  // post render
  useEffect(() => {
    // get the svg element in the DOM
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = document.getElementById("container").clientWidth,
      height = document.getElementById("container").clientHeight;

    const radius = d3.scaleLinear([6, -1], [0, 8]);

    const scale = (width - 120) * 0.5;
    const graticule = d3.geoGraticule().stepMinor([15, 10])();

    const projection = d3
      .geoStereographic()
      .reflectY(true)
      .scale(scale)
      .clipExtent([
        [0, 0],
        [width, height],
      ])
      .rotate([0, -90])
      .translate([width / 2, height / 2])
      .precision(0.1);
    const path = d3.geoPath(projection);
    const outline = d3.geoCircle().radius(90).center([0, 90])();

    svg
      .append("path")
      .attr("d", path(outline))
      .attr("fill", "none")
      .attr("stroke", "currentColor");

    svg
      .append("path")
      .attr("d", path(graticule))
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.2);

    // this def has something to do with it
    const angle = d3
      .scaleLinear()
      .domain([0, c.radials])
      .range([0, 2 * Math.PI]);

    var data = c.getMemberData(moment("2023-01-16"), c.radials, dataFile);
    data = data.map((d) => [d[1], angle(d[5])]);
    // data = data.map((d) => [angle(d[5]), d[1]]);
    console.log(data);

    const voronoi = d3.Delaunay.from(data.map(projection)).voronoi([
      0,
      0,
      width,
      height,
    ]);

    const cx = width / 2;
    const cy = height / 2;

    const focusDeclination = svg
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("fill", "none")
      .attr("stroke", "yellow");

    const focusRightAscension = svg
      .append("line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", cx)
      .attr("y2", cy)
      .attr("stroke", "yellow");

    svg
      .append("g")
      .attr("stroke", "black")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", (d) => radius(d.magnitude))
      .attr("transform", (d) => `translate(${projection(d)})`);

    svg
      .append("g")
      .attr("pointer-events", "all")
      .attr("fill", "none")
      .selectAll("path")
      .data(data)
      .join("path")
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted)
      .attr("d", (d, i) => voronoi.renderCell(i))
      .append("title")
      .text((d) => d[1]);

    function mouseovered(event, d) {
      const [px, py] = projection(d);
      const dx = px - cx;
      const dy = py - cy;
      const a = Math.atan2(dy, dx);
      focusDeclination.attr("r", Math.hypot(dx, dy));
      focusRightAscension
        .attr("x2", cx + 1e3 * Math.cos(a))
        .attr("y2", cy + 1e3 * Math.sin(a));
    }

    function mouseouted(event, d) {
      focusDeclination.attr("r", null);
      focusRightAscension.attr("x2", cx).attr("y2", cy);
    }
  }, []);

  console.log("render");

  return (
    <div id="outer-container" className="flex justify-end w-full h-full">
      <Head />
      <div
        id="container"
        className={`${c.containerBackgroundClasses} absolute w-full h-full`}
      >
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }}>
          <g></g>
        </svg>
      </div>
    </div>
  );
}
