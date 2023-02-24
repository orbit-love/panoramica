import c from "components/2023/common";
import * as d3 from "d3";
import moment from "moment";
import React, { useEffect, useRef } from "react";
import dataFile from "./data-mid.json";

import Head from "components/head";

export default function Starmap() {
  const svgRef = useRef();

  // post render
  useEffect(() => {
    // get the svg element in the DOM
    const svg = d3
      .select(svgRef.current)
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .style("margin", "0 -14px")
      .style("color", "white")
      // .style("background", `radial-gradient(#113 0%, ${c.backgroundColor} 50%)`)
      .style("background", "radial-gradient(#081f2b 0%, #061616 100%)")
      .style("display", "block");

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom().on("zoom", (e) => {
      g.attr("transform", e.transform);
      // g.style("stroke-width", 3 / Math.sqrt(transform.k));
      // points.attr("r", 3 / Math.sqrt(transform.k));
    });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    const width = document.getElementById("container").clientWidth,
      height = document.getElementById("container").clientHeight;

    const cx = width / 2;
    const cy = height / 2;

    const scale = (width - 120) * 0.75;
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

    // the circle around the whole thing
    // g.append("path")
    //   .attr("d", path(outline))
    //   .attr("fill", "none")
    //   .attr("stroke", "currentColor");

    // the grid
    g.append("path")
      .attr("d", path(graticule))
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.2);

    // convert the member id radial into a
    // const angle = d3
    //   .scaleLinear()
    //   .domain([0, c.radials])
    //   .range([0, 2 * Math.PI]);

    const degreeScale = d3.scaleLinear().domain([0, 52]).range([0, 90]);

    var data = c.getMemberData(moment("2023-01-16"), c.radials, dataFile);
    // d[0] is longitude, d[1] is latitude
    // d[0] should be between 0 and 24 * 15
    // d[1] should be between -90, 0, and 90
    data = data.map((d) => [d[0] % 360, degreeScale(d[1]), d[2]]);

    const voronoi = d3.Delaunay.from(data.map(projection)).voronoi([
      0,
      0,
      width,
      height,
    ]);

    // the yellow circle - radius is 0 so doesn't show at first
    const focusDeclination = g
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("fill", "none")
      .attr("stroke", "yellow");

    // the yellow line - cx and cy are equal so doesn't show at first
    const focusRightAscension = g
      .append("line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", cx)
      .attr("y2", cy)
      .attr("stroke", "yellow");

    // this is the scale for the star sizes
    const starRadius = d3
      .scalePow()
      .exponent(0.8)
      .domain([0, 52])
      .range([0, 5]);
    const memberRadius = (d) => starRadius(d[1]);

    // magnitude is the size
    g.append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", memberRadius)
      .attr("transform", (d) => `translate(${projection(d)})`);

    g.append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("transform", (d) => `translate(${projection(d)})`)
      .attr("dx", (d) => memberRadius(d) + 3)
      .attr("dy", (d) => memberRadius(d) / 2)
      .text((d) => (d[1] > 25 ? d[2].slice(0, 6) : null));

    // there are the cells; d attribute is the path for each data
    g.append("g")
      .attr("pointer-events", "all")
      .attr("fill", "none")
      .selectAll("path")
      .data(data)
      .join("path")
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted)
      .on("click", clickd)
      .attr("d", (d, i) => voronoi.renderCell(i))
      .append("title")
      .text((d) => d[2]);

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

    function clickd(event, d) {
      console.log(d[2]);
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
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
      </div>
    </div>
  );
}
