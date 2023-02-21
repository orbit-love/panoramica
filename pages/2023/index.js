import c from "components/2023/common";
import Community from "components/2023/community";
import Member from "components/2023/member";
import * as d3 from "d3";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dataFile from "./data-mid.json";

import Head from "components/head";

const minDate = c.minDate(dataFile);
const maxDate = c.maxDate(dataFile);

export default function Index() {
  const startDate = maxDate;

  const [animate, setAnimate] = useState(false);
  const [orbits] = useState(c.defaultOrbits);
  const [defaultTimer] = useState(startDate);
  const [timer, setTimer] = useState(defaultTimer);
  const [zoomTransform, setZoomTransform] = useState(
    d3.zoomIdentity.translate(0, 0).scale(c.defaultScale)
  );
  const [memberId, selectMemberId] = useState(null);

  // color according to distance from center
  // this can be done via OL, just set OL in the data object based on orbitLevel method
  const data = c.getMemberData(timer, c.radials, dataFile);
  const orbiters = c.membersByOrbitLevel(data, orbits);

  const colorScale = c.colorScale(data);
  const hotColdColorScale = c.hotColdColorScale();

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
    selectMemberId(null);
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
    }, c.animationDelay);

    const width = document.getElementById("container").clientWidth,
      height = document.getElementById("container").clientHeight,
      radius = Math.min(width, height) / 2 - 30;

    const max = 52;

    const angle = d3
      .scaleLinear()
      .domain([0, c.radials])
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
      .attr("fill", c.grayColor)
      .style("text-anchor", "middle")
      .style("font-size", "1.3em")
      .text(function (d, i) {
        return "L" + (4 - i);
      });

    gr.append("text")
      .attr("y", function (d) {
        return -r(d) - 8;
      })
      .attr("transform", "rotate(-45)")
      .attr("fill", c.grayColor)
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
      .attr("fill", c.grayColor)
      .style("text-anchor", "middle")
      .text(function (d, i) {
        return orbiters[4 - i];
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
        return angle(d[5]);
      })
      .radius(function (d) {
        return r(max - d[1]);
      });

    function onMouseOver(d, i) {
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

    function onClick(e, d) {
      selectMemberId(d[0]);
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
      // .on("mouseover", onMouseOver)
      // .on("mouseout", onMouseOut)
      .on("click", onClick);

    g.append("circle")
      .attr("class", "point")
      .attr("r", function (d, i) {
        return 5 - c.orbitLevel(d[1], orbits);
      })
      .attr("fill", function (d, i) {
        return hotColdColorScale(d[3]);
      })
      .attr("stroke", function (d, i) {
        if (d[0] === memberId) {
          return "yellow";
        }
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
        const ol = c.orbitLevel(d[1], orbits);
        if (ol === 1 || ol === 2 || d[0] === memberId) {
          return d[2].slice(0, 6);
        }
        // return d[2].slice(0, 1);
        // return 52 - d[1];
      })
      .attr("fill", function (d, i) {
        if (d[0] === memberId) {
          return "yellow";
        } else {
          return colorScale(d[1]);
        }
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
    colorScale,
    hotColdColorScale,
    memberId,
    selectMemberId,
    maxDate,
    orbiters,
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
        d3.zoomIdentity.translate(width / 2, height / 2).scale(c.defaultScale)
      );
    }

    svg.call(zoom).call(zoom.transform, zoomTransform);
  }, [zoomTransform.x, zoomTransform.y, zoomTransform.k, zoomTransform]);

  console.log("render");

  const member = data.find((elem) => elem[0] === memberId);

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
      <div
        className={`${c.panelBackgroundClasses} flex z-10 flex-col pt-3 px-6 pb-6 space-y-2 text-left`}
      >
        <div className="">
          <div className="text-lg font-semibold">
            <div>A Community</div>
          </div>
          <div>{timer.format("MMMM D, YYYY")}</div>
          <div>{data.length} members</div>
        </div>
        <div />
        <div className="flex space-x-2 w-48">
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
        </div>
        <div className="flex space-x-2">
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
            <button className="btn btn-slate" onClick={resetTimer}>
              Reset
            </button>
          }
        </div>
        {member && <Member data={data} orbits={orbits} memberId={memberId} />}
        {!memberId && data.length > 0 && (
          <Community data={data} orbits={orbits} memberId={memberId} />
        )}
      </div>
    </div>
  );
}
