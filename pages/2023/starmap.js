import c from "components/2023/common";
import Member from "components/2023/member";
import * as d3 from "d3";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import dataFile from "./data-mid.json";
import Head from "components/head";

// d[0] is longitude, d[1] is latitude
// d[0] should be between 0 and 24 * 15
// d[1] should be between -90, 0, and 90
var defaultData = c.getMemberDataNew(moment("2023-01-16"), dataFile);
const degreeScale = d3.scaleLinear().domain([0, 52]).range([0, 90]);
defaultData = defaultData.map((d) => {
  d[0] = d.member_id % 360;
  d[1] = degreeScale(d.weeks_active_last_52);
  return d;
});

// removing clip extent prevents the projection from getting
// cut off at the viewport boundary
// but the boundary is where we lose the click events
const getExtent = (width, height) => {
  return [
    [-0.75 * width, -height],
    [width * 1.75, height * 2],
  ];
};
const getProjection = (scale, width, height) => {
  return (
    d3
      .geoStereographic()
      .reflectY(true)
      .scale(scale)
      // this keeps the rays shooting out farther
      .clipExtent(getExtent(width, height))
      .rotate([0, -90])
      .translate([width / 2, height / 2])
      .precision(0.1)
  );
};

const getScale = (width) => (width - 100) * 0.45;

export default function Starmap() {
  const svgRef = useRef();

  const [data] = useState(defaultData);
  const [member, setMember] = useState(null);
  const [frozen, setFrozen] = useState(false);
  const [zoomIdentity, setZoomIdentity] = useState(
    d3.zoomIdentity.translate(0, 0).scale(1)
  );

  // post render
  useEffect(() => {
    console.log("use Effect canvas");
    const width = document.getElementById("container").clientWidth,
      height = document.getElementById("container").clientHeight;

    // get the svg element in the DOM
    const svg = d3
      .select(svgRef.current)
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .style("color", "white")
      .style(
        "background",
        "radial-gradient(rgb(8, 31, 43) 0%, rgb(6, 20, 20) 100%)"
      )
      .style("display", "block");

    const g = svg.select("g").empty() ? svg.append("g") : svg.select("g");
    g.selectAll(".outline-circle").remove();
    g.selectAll(".grid").remove();

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .translateExtent(getExtent(width, height))
      .on("zoom", (e, d) => {
        g.attr("transform", e.transform);
        setZoomIdentity(e.transform);
      });

    svg.call(zoom).call(zoom.transform, zoomIdentity);

    const scale = getScale(width);
    const projection = getProjection(scale, width, height);
    const graticule = d3.geoGraticule().stepMinor([15, 10])();
    const path = d3.geoPath(projection);
    const outline = d3.geoCircle().radius(90).center([0, 90])();

    // the circle around the whole thing
    g.append("path")
      .attr("class", "outline-circle")
      .attr("d", path(outline))
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.3);

    // the grid
    g.append("path")
      .attr("class", "grid")
      .attr("d", path(graticule))
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1);
  }, [data, frozen]);
  // explicitly don't put zoom identity here so there's no re-render

  useEffect(() => {
    console.log("use Effect Member");
    const findMember = (memberId) => {
      return data.find((elem) => elem.member_id === memberId);
    };

    const svg = d3.select(svgRef.current);
    const g = svg.select("g").empty() ? svg.append("g") : svg.select("g");
    g.selectAll("g").remove();
    g.selectAll("circle").remove();
    g.selectAll("line").remove();
    g.selectAll("text").remove();

    const width = document.getElementById("container").clientWidth,
      height = document.getElementById("container").clientHeight;

    const scale = getScale(width);
    const projection = getProjection(scale, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // the tracing circle - radius is 0 so doesn't show at first
    const focusDeclination = g
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("fill", "none")
      .attr("stroke", c.tracingColor)
      .attr("stroke-opacity", 0.8);

    // the tracing line - cx and cy are equal so doesn't show at first
    const focusRightAscension = g
      .append("line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", cx)
      .attr("y2", cy)
      .attr("stroke", c.tracingColor)
      .attr("stroke-opacity", 0.8);

    // update on mouseover or on re-render
    const updateAscensions = (member) => {
      if (member) {
        const [px, py] = projection(member);
        const dx = px - cx;
        const dy = py - cy;
        const a = Math.atan2(dy, dx);
        focusDeclination.attr("r", Math.hypot(dx, dy));
        focusRightAscension
          .attr("x2", cx + 1e3 * Math.cos(a))
          .attr("y2", cy + 1e3 * Math.sin(a));
      } else {
        focusDeclination.attr("r", null);
        focusRightAscension.attr("x2", cx).attr("y2", cy);
      }
    };

    // this is the scale for the star sizes
    const starRadius = d3
      .scalePow()
      .exponent(0.8)
      .domain([0, 52])
      .range([0, 4]);

    const memberRadius = (d) => starRadius(d.weeks_active_last_52);

    const addLabel = (member) => {
      g.append("text")
        .attr("class", "label")
        .attr("transform", `translate(${projection(member)})`)
        .attr("dx", memberRadius(member) + 5)
        .attr("dy", memberRadius(member) / 2 + 1)
        .text(member.member_name)
        .attr("fill", frozen ? c.tracingColor : null)
        // put it on top of the voronoi path but don't trap events
        .attr("pointer-events", "none")
        .raise();
    };

    const addCircles = (member) => {
      // magnitude is the size
      g.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("r", memberRadius)
        .attr("transform", (d) => `translate(${projection(d)})`)
        .attr("fill", (d) =>
          member && d.member_id === member.member_id ? c.tracingColor : null
        );
    };

    addCircles(member);

    // add these after circles so they sit on top
    if (member) {
      updateAscensions(member);
      addLabel(member);
    }

    const voronoi = d3.Delaunay.from(data.map(projection)).voronoi([
      0,
      0,
      width,
      height,
    ]);

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
      .attr("d", (d, i) => voronoi.renderCell(i));

    function mouseovered(e, d) {
      if (!frozen) {
        addLabel(d);
        updateAscensions(d);
        setMember(findMember(d.member_id));
      }
    }

    function mouseouted(event, d) {
      if (!frozen) {
        // avoid loops, don't do anything if there is no selected member
        if (member) setMember(null);
        g.selectAll(".label").remove();
        focusDeclination.attr("r", null);
        focusRightAscension.attr("x2", cx).attr("y2", cy);
      }
    }

    function clickd(event, d) {
      // todo freeze
      if (frozen) {
        setMember(null);
      }
      setFrozen(!frozen);
    }
  }, [data, frozen]);
  // member is deliberately not here to avoid the rerender

  console.log("render");

  const onReset = () => {
    setMember(null);
    setFrozen(false);
  };

  return (
    <div id="outer-container flex w-full h-full overflow-hidden">
      <Head />
      <div
        id="container"
        className={`${c.containerBackgroundClasses} absolute w-full h-full`}
      >
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
      </div>
      <div
        className={`flex absolute right-0 z-10 flex-col justify-center pt-3 px-4 pb-6 space-y-6 h-full text-left pointer-events-none`}
      >
        <div className="flex-1" />
        {member && (
          <div className={`${c.panelBackgroundClasses}`}>
            <Member
              orbits={c.defaultOrbits}
              member={member}
              expanded={frozen}
              onReset={onReset}
            />
          </div>
        )}
        <div className="flex-1" />
        <div className={`${c.panelBackgroundClasses}`}>
          <div className="text-lg font-semibold">
            <div>Orbit Community</div>
          </div>
          <div>{data.length} members</div>
        </div>
      </div>
    </div>
  );
}
