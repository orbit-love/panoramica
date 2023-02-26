import c from "components/2023/common";
import Member from "components/2023/member";
import * as d3 from "d3";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import dataFile from "./data-mid.json";
import Head from "components/head";

const initials = (name) => {
  var array = name.split(" ");
  var part1 = array[0];
  var part2 = array.length > 1 ? array[1].slice(0, 1) : null;
  if (part2 && part2.length > 0) {
    part2 = " " + part2;
    part1 += part2;
  }
  return part1;
};

// d[0] is longitude, d[1] is latitude
// d[0] should be between 0 and 24 * 15
// d[1] should be between -90, 0, and 90
var defaultData = c.getMemberDataNew(moment("2023-01-16"), dataFile);
// the exponent scrunches together the inside where the gaps between weeks are large
// at the edges it's much smaller
const boundary = 9; // weeks
const degreeScaleO12 = d3
  .scalePow()
  .exponent(0.7)
  .domain([boundary + 1, 52])
  .range([0, 90]);
const degreeScaleO34 = d3
  .scalePow()
  .exponent(1.4)
  .domain([0, boundary])
  .range([-55, -5]);
//
defaultData = defaultData.map((d) => {
  var degree = 0;
  // so at the edges, we scale out further
  if (d.weeks_active_last_52 < 10) {
    degree += degreeScaleO34(d.weeks_active_last_52);
    // add some randomness so dots aren't on top of each other
    degree += 2 - (d.member_id % 5);
  } else {
    degree += degreeScaleO12(d.weeks_active_last_52);
  }
  d[0] = d.member_id % 360;
  d[1] = degree;
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
  const [zoomIdentity, setZoomIdentity] = useState(
    d3.zoomIdentity.translate(0, 0).scale(c.initialZoomScale)
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

    // make it as simple as - in the viewport, show, otherwise hide
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
  }, [data]);
  // explicitly don't put zoom identity here so there's no re-render

  useEffect(() => {
    console.log("use Effect Member");
    const findMember = (memberId) => {
      return data.find((elem) => elem.member_id === memberId);
    };

    const svg = d3.select(svgRef.current);
    const g = svg.select("g").empty() ? svg.append("g") : svg.select("g");
    g.selectAll("g").remove();
    // do we need these if we remove the g?
    g.selectAll("circle").remove();
    g.selectAll("line").remove();
    g.selectAll("text").remove();

    const width = document.getElementById("container").clientWidth,
      height = document.getElementById("container").clientHeight;

    const scale = getScale(width);
    const projection = getProjection(scale, width, height);

    // this is the scale for the star sizes
    const starRadius = d3
      .scalePow()
      .exponent(0.8)
      .domain([0, 52])
      .range([3, 10]);

    const memberRadius = (d) => starRadius(d.weeks_active_last_52);

    const colorForMember = (d, member) => {
      return member && d.member_id == member.member_id
        ? c.selectedTextColor
        : c.textColor;
    };

    const addLabels = (member) => {
      g.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("class", "member-label")
        .attr("transform", (d) => `translate(${projection(d)})`)
        .attr("text-anchor", "middle")
        // .attr("dx", (d) => memberRadius(d) + 3)
        .attr("dy", (d) => memberRadius(d) * 2 + 4)
        .text((d) => initials(d.member_name))
        .attr("fill", (d) => colorForMember(d, member))
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted)
        .on("click", clickd);
    };

    const addCircles = (member) => {
      // magnitude is the size
      g.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "member-circle")
        .attr("r", memberRadius)
        .attr("transform", (d) => `translate(${projection(d)})`)
        .attr("fill", (d) => colorForMember(d, member))
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted)
        .on("click", clickd);
    };

    addCircles(member);
    addLabels(member);

    function mouseovered(e, d) {
      g.selectAll("g")
        .selectAll("circle, text")
        .filter(
          (dd) =>
            d.member_id === dd.member_id && d.member_id !== member?.member_id
        )
        .attr("fill", c.hoverTextColor);
    }

    function mouseouted(event, d) {
      g.selectAll("g")
        .selectAll("circle, text")
        .filter(
          (dd) =>
            d.member_id === dd.member_id && d.member_id !== member?.member_id
        )
        .attr("fill", c.textColor);
    }

    function clickd(event, d) {
      setMember(findMember(d.member_id));
    }
  }, [data, member]);
  // member is deliberately not here to avoid the rerender

  console.log("render");

  const onReset = () => {
    setMember(null);
    // setFrozen(false);
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
        className={`flex absolute left-0 z-10 flex-col justify-start pt-3 px-4 pb-6 space-y-6 h-full text-left pointer-events-none`}
      >
        {member && (
          <div className={`${c.panelBackgroundClasses}`}>
            <Member
              orbits={c.defaultOrbits}
              member={member}
              expanded={true}
              onReset={onReset}
            />
          </div>
        )}
        <div className="flex-1" />
        <div className={`${c.panelBackgroundClasses}`}>
          <div className="py-3 px-4">
            <div className="text-lg font-semibold">
              <div>Orbit Community</div>
            </div>
            <div>{data.length} members</div>
          </div>
        </div>
      </div>
    </div>
  );
}
