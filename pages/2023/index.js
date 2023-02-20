import React, { useEffect, useState, useCallback, useRef } from "react";
import moment from "moment";
import * as d3 from "d3";
import dataFile from "./data-mid.json";

import Head from "components/head";
// import Header from "components/header";
// import Footer from "components/footer";

// moment(
//   Math.min(
//     null,
//     dataFile.map((elem) => moment(elem.week_start))
//   )
// );
const maxDate = moment("2023-01-16");
//  moment(
//   Math.max.apply(
//     null,
//     dataFile.map((elem) => moment(elem.week_start))
//   )
// );
const ll = moment(maxDate);
ll.subtract(52, "weeks");
const minDate = ll;

const getMemberData = (week, radials) => {
  // find members who have a non-zero trailing 52w average
  // from the perspective of the week passed in
  return dataFile
    .filter(
      (elem) =>
        elem.week_start === week.format("YYYY-MM-DD") &&
        elem.weeks_active_last_52 >= 3
    )
    .map((elem) => [
      elem.member_id % radials,
      elem.weeks_active_last_52,
      elem.member_name,
    ]);
};

const orbitLevel = (weeks_active, orbits) => {
  if (weeks_active >= orbits[3]) {
    return 1;
  } else if (weeks_active >= orbits[2]) {
    return 2;
  } else if (weeks_active >= orbits[1]) {
    return 3;
  } else if (weeks_active >= orbits[0]) {
    return 4;
  }
};

export default function Index() {
  const radials = 365;
  const animationDelay = 250;
  const startDate = maxDate;

  const [animate, setAnimate] = useState(false);
  const [orbits, setOrbits] = useState([3, 9, 20, 36]);
  const [defaultTimer, setDefaultTimer] = useState(startDate);
  const [timer, setTimer] = useState(defaultTimer);
  const [zoomTransform, setZoomTransform] = useState(
    d3.zoomIdentity.translate(0, 0).scale(1.2)
  );

  const grayColor = "#459";
  const dotColor = "#ececec";
  const dotColorFaded = grayColor;
  const containerBackgroundClasses = "bg-[#0F0A25]";
  const panelBackgroundClasses = "bg-opacity-40 bg-[#0F0A25]";

  // get the data that'll be used for this render based on the timer
  // this is expensive, just cache it with the timer?

  // color according to the member
  // const color = d3
  //   .scaleOrdinal(d3.schemeCategory10)
  //   .domain(Array.from(Array(radials).keys()));

  // color according to distance from center
  // this can be done via OL, just set OL in the data object based on orbitLevel method
  const data = getMemberData(timer, radials);
  const minWeeks = Math.min.apply(
    null,
    data.map((d) => d[1])
  );
  const maxWeeks = Math.max.apply(
    null,
    data.map((d) => d[1])
  );

  const orbit1 = data.filter((d) => orbitLevel(d[1], orbits) === 1).length;
  const orbit2 = data.filter((d) => orbitLevel(d[1], orbits) === 2).length;
  const orbit3 = data.filter((d) => orbitLevel(d[1], orbits) === 3).length;
  const orbit4 = data.filter((d) => orbitLevel(d[1], orbits) === 4).length;
  const o123_members = orbit1 + orbit2 + orbit3;
  const o1234_members = orbit1 + orbit2 + orbit3 + orbit4;
  // const o1_percent = Math.round((orbit1 / o123_members) * 100);
  // const o2_percent = Math.round((orbit2 / o123_members) * 100);
  // const o3_percent = Math.round((orbit3 / o123_members) * 100);

  const colorDomain = [minWeeks, maxWeeks];
  const color = d3
    .scalePow()
    .exponent(0.25)
    .domain(colorDomain)
    .range([dotColorFaded, dotColor]);

  const previousWeek = () => {
    const d = moment(timer);
    d.subtract(1, "weeks");
    setTimer(d);
  };
  const playAnimation = () => {
    if (timer.isSame(startDate)) {
      setTimer(minDate);
    }
    setAnimate(true);
  };
  const pauseAnimation = () => {
    setAnimate(false);
  };
  const resetTimer = () => {
    setTimer(startDate);
  };

  const nextWeek = useCallback(() => {
    const d = moment(timer);
    d.add(1, "weeks");
    setTimer(d);
  }, [timer]);

  const svgRef = useRef();

  // post render
  useEffect(() => {
    console.log("useEffect1");
    const interval = setInterval(() => {
      if (animate) {
        if (timer.isSame(maxDate)) {
          setAnimate(false);
        } else {
          nextWeek();
        }
      }
    }, animationDelay);

    const width = document.getElementById("container").clientWidth,
      height = document.getElementById("container").clientHeight,
      radius = Math.min(width, height) / 2 - 30;

    const max = 52;

    const angle = d3
      .scaleLinear()
      .domain([0, radials])
      .range([0, 2 * Math.PI]);

    const r = d3.scalePow().exponent(1.4).domain([0, max]).range([0, radius]);

    // get the svg element in the DOM
    const svg = d3.select(svgRef.current);

    // get the g element
    const innerG = svg.select("g");
    // remove everything in there
    innerG.selectAll("*").remove();
    // set the dimensions and initial transformation of the rectangle

    // set the attributes
    innerG
      .attr("width", width)
      .attr("height", height)
      .attr("transform", zoomTransform);

    const gr = innerG
      .append("g")
      .attr("class", "r axis")
      .selectAll("g")
      .data([
        max - orbits[0],
        max - orbits[1],
        max - orbits[2],
        max - orbits[3],
      ])
      .enter()
      .append("g");

    gr.append("circle").attr("r", r);

    gr.append("text")
      .attr("y", function (d) {
        return -r(d) + 26;
      })
      .attr("transform", "rotate(0)")
      .attr("fill", grayColor)
      .style("text-anchor", "middle")
      .style("font-size", "1.1em")
      .text(function (d, i) {
        return "L" + (4 - i);
      });

    gr.append("text")
      .attr("y", function (d) {
        return -r(d) - 8;
      })
      .attr("transform", "rotate(-45)")
      .attr("fill", grayColor)
      .style("text-anchor", "middle")
      .text(function (d, i) {
        if (max - d === 3) return "active " + (max - d) + "+ wks / last 52";
        else return max - d + "+ wks";
      });

    gr.append("text")
      .attr("y", function (d) {
        return r(d) - 12;
      })
      .attr("transform", "rotate(0)")
      .attr("fill", grayColor)
      .style("text-anchor", "middle")
      .text(function (d, i) {
        return eval(`orbit${4 - i}`) + "";
      });

    const ga = innerG
      .append("g")
      .attr("class", "a axis")
      .selectAll("g")
      .data(d3.range(-90, 270, 45))
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return "rotate(" + d + ")";
      });

    // crosshair style lines
    // a hack right now to put a star at the center
    ga.append("line").attr("x2", 10);

    const line = d3
      .lineRadial()
      .angle(function (d) {
        return angle(d[0]);
      })
      .radius(function (d) {
        return r(max - d[1]);
      });

    function onMouseOver(d, i) {
      // d3.select(this).transition().duration("50").attr("opacity", ".85");
      // d3.select(this).select(".hideable").attr("class", "hideable");

      const size = 100;

      const tooltip = d3.select(this);

      tooltip
        .append("rect")
        .attr("class", "tooltip tooltip-rect")
        .attr("width", size)
        .attr("height", size)
        .attr("x", -size / 2)
        .attr("y", -size);

      const tooltipContent = tooltip
        .append("text")
        .attr("class", "tooltip tooltip-content")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", -size + 20);

      tooltipContent
        .append("tspan")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .text(function (d, i) {
          return d[2];
        });
      tooltipContent
        .append("tspan")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .text(function (d, i) {
          return `${d[1]} weeks`;
        });
    }

    function onMouseOut(d, i) {
      d3.select(this).selectAll(".tooltip").remove();
    }

    function onClick(d, i) {
      console.log("clicked");
    }

    const g = innerG
      .selectAll("point")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "member")
      .attr("transform", function (d) {
        const coors = line([d]).slice(1).slice(0, -1);
        return "translate(" + coors + ")";
      })
      .on("mouseover", onMouseOver)
      .on("mouseout", onMouseOut)
      .on("click", onClick);

    g.append("circle")
      .attr("class", "point")
      .attr("r", function (d, i) {
        return 5 - orbitLevel(d[1], orbits);
      })
      .attr("fill", function (d, i) {
        return color(d[1]);
      });

    g.append("text")
      .attr("class", "point-label")
      .attr("dx", "7px")
      .style("alignment-baseline", "middle")
      .text(function (d, i) {
        // return d[0];
        // return 52 - d[1];
        // return d[1];
        // return d[2];
        const ol = orbitLevel(d[1], orbits);
        if (ol === 1 || ol === 2) {
          return d[2].slice(0, 6);
        }
        // return d[2].slice(0, 1);
        // return 52 - d[1];
      })
      .attr("fill", function (d, i) {
        return color(d[1]);
      });

    return () => clearInterval(interval);
  }, [
    timer,
    defaultTimer,
    orbits,
    data,
    animate,
    nextWeek,
    zoomTransform,
    color,
    orbit1,
    orbit2,
    orbit3,
    orbit4,
  ]);

  useEffect(() => {
    console.log("useEffect2");

    // get the svg element in the DOM
    const svg = d3.select(svgRef.current);

    const zoom = d3.zoom().on("zoom", (e) => {
      if (
        zoomTransform.x != e.transform.x ||
        zoomTransform.y != e.transform.y ||
        zoomTransform.k != e.transform.k
      ) {
        // ideally we do the other one, but need to think through the right way
        setZoomTransform(e.transform);
        // const rect = svg.select("g");
        // rect.attr("transform", e.transform);
      }
    });

    if (zoomTransform.x === 0) {
      const width = document.getElementById("container").clientWidth,
        height = document.getElementById("container").clientHeight;
      setZoomTransform(
        d3.zoomIdentity.translate(width / 2, height / 2).scale(1.2)
      );
    }

    svg.call(zoom).call(zoom.transform, zoomTransform);
  }, [zoomTransform.x, zoomTransform.y, zoomTransform.k, zoomTransform]);

  console.log("render");

  return (
    <div id="outer-container" className="w-full h-full">
      <div
        id="container"
        className={`${containerBackgroundClasses} relative w-full h-full`}
      >
        <Head />
        <div
          className={`${panelBackgroundClasses} flex absolute bottom-2 right-3 flex-col pt-3 px-4 pb-6 space-y-2 text-right`}
        >
          <div className="">
            <div className="text-lg font-semibold">
              <div>Orbit Community</div>
            </div>
            <div>{timer.format("MMMM D, YYYY")}</div>
            <div>{o1234_members} members</div>
          </div>
          <div />
          <div className="flex justify-end space-x-2">
            {!timer.isSame(minDate) && (
              <button className="btn btn-slate w-20" onClick={previousWeek}>
                &lsaquo; {moment(timer).subtract(1, "week").format("MMM D")}
              </button>
            )}
            {!timer.isSame(maxDate) && (
              <button className="btn btn-slate w-20" onClick={nextWeek}>
                {moment(timer).add(1, "week").format("MMM D")} &rsaquo;
              </button>
            )}
            {!animate && (
              <button className="btn btn-purple" onClick={playAnimation}>
                Play
              </button>
            )}
            {animate && (
              <button className="btn btn-purple" onClick={pauseAnimation}>
                Pause
              </button>
            )}
            {
              <button className="btn btn-purple" onClick={resetTimer}>
                Reset
              </button>
            }
          </div>
          {/* <div /> */}
          {/* <div className="flex flex-col text-right">
            <div>
              Orbit 1: {orbit1} {o1_percent}%
            </div>
            <div>
              Orbit 2: {orbit2} {o2_percent}%
            </div>
            <div>
              Orbit 3: {orbit3} {o3_percent}%
            </div>
            <div></div>
            <div>Orbit 4: {orbit4}</div>
          </div> */}
        </div>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }}>
          <g></g>
        </svg>
      </div>
    </div>
  );
}
