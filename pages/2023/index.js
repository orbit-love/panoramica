import c from "components/2023/common";
import Community from "components/2023/community";
import Member from "components/2023/member";
import TimeControl from "components/2023/time_control";
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
    d3.zoomIdentity.translate(0, 0).scale(c.initialZoomScale)
  );
  const [memberId, selectMemberId] = useState(null);

  // color according to distance from center
  // this can be done via OL, just set OL in the data object based on orbitLevel method
  const data = c.getMemberData(timer, c.radials, dataFile);
  const orbiters = c.membersByOrbitLevel(data, orbits);

  const colorScale = c.colorScale(data);
  const hotColdColorScale = c.hotColdColorScale();

  const svgRef = useRef();

  // post render
  useEffect(() => {
    console.log("useEffect1");
    const interval = setInterval(() => {
      if (animate) {
        if (timer.isSame(maxDate)) {
          setAnimate(false);
        } else {
          // set the next week
          const d = moment(timer);
          d.add(1, "weeks");
          setTimer(d);
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

    const r = d3
      .scalePow()
      .exponent(c.rAxisExponent)
      .domain([0, max])
      .range([0, radius]);

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

    function onMouseOver(e, d, i) {
      d3.select(this)
        .select(".point-label")
        .attr("fill", "white")
        .text(pointLabelText(d, i, e, true));
    }

    function onMouseOut(e, d, i) {
      // d3.select(this).select(".point").attr("stroke", hotColdColorScale(d[3]));
      // var fill = d[0] === memberId ? "yellow" : colorScale(d[1]);
      // d3.select(this).select(".point-label").attr("fill", fill);
      var fill;
      if (d[0] === memberId) {
        fill = "yellow";
      } else {
        fill = colorScale(d[1]);
      }
      d3.select(this)
        .select(".point-label")
        .text(pointLabelText(d))
        .attr("fill", fill);
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
      .on("mouseover", onMouseOver)
      .on("mouseout", onMouseOut)
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

    const pointLabelText = (d, i, e, force) => {
      // return d[0];
      // return 52 - d[1];
      // return d[1];
      // return d[2];
      // return d[2].slice(0, 1);
      // return 52 - d[1];
      const ol = c.orbitLevel(d[1], orbits);
      if (ol === 1 || ol === 2 || d[0] === memberId || force) {
        return d[2].slice(0, 6);
      }
    };

    g.append("text")
      .attr("class", "point-label")
      .attr("dx", "7px")
      .style("alignment-baseline", "middle")
      .text(pointLabelText)
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
    zoomTransform,
    colorScale,
    hotColdColorScale,
    memberId,
    selectMemberId,
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
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(c.initialZoomScale)
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
        {
          <TimeControl
            timer={timer}
            setTimer={setTimer}
            minDate={minDate}
            maxDate={maxDate}
            selectMemberId={selectMemberId}
            animate={animate}
            setAnimate={setAnimate}
          />
        }
        {member && <Member orbits={orbits} member={member} />}
        {!memberId && data.length > 0 && (
          <Community data={data} orbits={orbits} />
        )}
      </div>
    </div>
  );
}
