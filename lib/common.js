import { useEffect, useRef } from "react";
import moment from "moment";
import * as d3 from "d3";

const whiteColor = "#eef2ff";
const orbitPink = "#EF04F3";
const dotColor = "#ececec";
const grayColor = "#67a";
const dotColorFaded = grayColor;
const hotColdColorRange = ["blue", orbitPink];
const backgroundColor = "#0F0A25";
const neutralColor = "#818cf8";
const selectedColor = "#ffeb3b";
const panelColor = "#1D1640";

const indigo100 = "#eef2ff";
const indigo400 = "#818cf8";
const indigo800 = "#3730a3";
const indigo900 = "#312e81";

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
  backgroundColor,
  orbitPink,
  neutralColor,
  whiteColor,
  selectedColor,
  panelColor,
  indigo100,
  indigo400,
  indigo800,
  indigo900,
  tracingColor: orbitPink,
  containerBackgroundClasses: `bg-[${backgroundColor}]`,
  panelBackgroundClasses: "bg-violet-100 text-black w-72",
  radials: 360,
  animationDelay: 250,

  textColor: grayColor,
  hoverTextColor: dotColor,
  selectedTextColor: orbitPink,

  initialZoomScale: 1,
  defaultOrbits: [3, 6, 11, 22],
  rAxisExponent: 1.4,

  colorScale,
  hotColdColorScale,
  hotColdColorRange,

  orbitLevel,
  membersByOrbitLevel: (data, orbits) => {
    const orbit1 = data.filter(
      (d) => orbitLevel(d.weeks_active_last_52, orbits) === 1
    ).length;
    const orbit2 = data.filter(
      (d) => orbitLevel(d.weeks_active_last_52, orbits) === 2
    ).length;
    const orbit3 = data.filter(
      (d) => orbitLevel(d.weeks_active_last_52, orbits) === 3
    ).length;
    const orbit4 = data.filter(
      (d) => orbitLevel(d.weeks_active_last_52, orbits) === 4
    ).length;
    return [
      orbit1,
      orbit2,
      orbit3,
      orbit4,
      orbit1 + orbit2 + orbit3,
      orbit1 + orbit2 + orbit3 + orbit4,
    ];
  },
  getMemberDataNew: (week, dataFile) => {
    return dataFile.filter(
      (elem) =>
        elem.week_start === week.format("YYYY-MM-DD") &&
        elem.weeks_active_last_52 >= 3
    );
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
  formatNumber: (num, digits) => {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return num >= item.value;
      });
    return item
      ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
      : "0";
  },
  initials: (name) => {
    var [w0, w1] = name.split(" ");
    if (w1) {
      return w0.slice(0, 1) + w1.slice(0, 1);
    } else {
      return w0.slice(0, 2);
    }
  },
  cyrb128: function (str) {
    let h1 = 1779033703,
      h2 = 3144134277,
      h3 = 1013904242,
      h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [
      (h1 ^ h2 ^ h3 ^ h4) >>> 0,
      (h2 ^ h1) >>> 0,
      (h3 ^ h1) >>> 0,
      (h4 ^ h1) >>> 0,
    ];
  },

  mulberry32: function (a) {
    return function () {
      var t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  usePrevious: function (value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value; //assign the value of ref to the argument
    }, [value]); //this code will run when the value of 'value' changes
    return ref.current; //in the end, return the current ref value.
  },

  fuzz: function (rand, value, factor = 0.15) {
    var r = rand() - 0.5;
    var shift = r * value * factor;
    return value + shift;
  },
  slugify: (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, ""),
};

export default common;
