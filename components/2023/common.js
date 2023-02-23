import React from "react";
import moment from "moment";
import * as d3 from "d3";

const dotColor = "#ececec";
const grayColor = "#459";
const dotColorFaded = grayColor;
const hotColdColorRange = [dotColorFaded, "red"];

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

const colorScale = (data) => {
  const minWeeks = Math.min.apply(
    null,
    data.map((d) => d[1])
  );
  const maxWeeks = Math.max.apply(
    null,
    data.map((d) => d[1])
  );

  const colorDomain = [minWeeks, maxWeeks];
  return d3
    .scalePow()
    .exponent(0.25)
    .domain(colorDomain)
    .range([dotColorFaded, dotColor]);
};
const hotColdColorScale = () =>
  d3.scaleLinear().domain([0, 6]).range(hotColdColorRange);

const common = {
  dotColor,
  grayColor,
  dotColorFaded,
  containerBackgroundClasses: "bg-[#0F0A25]",
  panelBackgroundClasses: "bg-opacity-10 bg-white",
  radials: 365,
  animationDelay: 250,

  initialZoomScale: 1.4,
  defaultOrbits: [3, 9, 20, 36],
  rAxisExponent: 1.4,

  colorScale,
  hotColdColorScale,

  orbitLevel,
  membersByOrbitLevel: (data, orbits) => {
    const orbit1 = data.filter((d) => orbitLevel(d[1], orbits) === 1).length;
    const orbit2 = data.filter((d) => orbitLevel(d[1], orbits) === 2).length;
    const orbit3 = data.filter((d) => orbitLevel(d[1], orbits) === 3).length;
    const orbit4 = data.filter((d) => orbitLevel(d[1], orbits) === 4).length;
    return [
      orbit1,
      orbit2,
      orbit3,
      orbit4,
      orbit1 + orbit2 + orbit3,
      orbit1 + orbit2 + orbit3 + orbit4,
    ];
  },
  // todo: get the data that'll be used for this render based on the timer
  // this is expensive, just cache it with the timer?
  getMemberData: (week, radials, dataFile) => {
    // find members who have a non-zero trailing 52w average
    // from the perspective of the week passed in
    return dataFile
      .filter(
        (elem) =>
          elem.week_start === week.format("YYYY-MM-DD") &&
          elem.weeks_active_last_52 >= 3
      )
      .map((elem) => [
        elem.member_id,
        elem.weeks_active_last_52,
        elem.member_slug,
        elem.weeks_active_last_6,
        elem.member_name,
        elem.member_id % radials,
      ]);
  },
  maxDate: (dataFile) =>
    moment(
      Math.max.apply(
        null,
        dataFile.map((elem) => moment(elem.week_start))
      )
    ),
  minDate: (dataFile) =>
    moment(
      Math.min.apply(
        null,
        dataFile.map((elem) => moment(elem.week_start))
      )
    ),
};

export default common;
