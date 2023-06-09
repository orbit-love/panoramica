import { useEffect, useRef } from "react";
import * as d3 from "d3";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

const whiteColor = "#eef2ff";
const backgroundColor = "#150D33";
const neutralColor = "#818cf8";
const selectedColor = colors.yellow[100];
const purpleBgColor = "#1D1640";

const indigo100 = "#eef2ff";
const indigo200 = "#c7d2fe";
const indigo300 = "#a5b4fc";
const indigo400 = "#818cf8";
const indigo500 = "#6366f1";
const indigo600 = "#4f46e5";
const indigo700 = "#4338ca";
const indigo800 = "#3730a3";
const indigo900 = "#312e81";

// transform a 0-1 value into 1,2,3
const scale123 = d3.scaleQuantize().domain([0, 1]).range([1, 2, 3]);

const common = {
  backgroundColor,
  neutralColor,
  whiteColor,
  selectedColor,
  purpleBgColor,
  indigo100,
  indigo200,
  indigo300,
  indigo400,
  indigo500,
  indigo600,
  indigo700,
  indigo800,
  indigo900,
  scale123,
  orbitLevelColorScale: (value) => orbitLevelColorScale(value),
  buttonClasses:
    "whitespace-nowrap flex-1 px-4 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-600 rounded-md select-none outline-none",
  inputClasses:
    "px-2 py-2 w-full text-sm text-black bg-indigo-100 rounded outline-none",

  data: {
    // how many advocates to create by default
    advocateCount: 5,
    // the number of connections to create after being multiplied by advocateCount
    connectionFactor: 15,
    // randomness seed
    randomnessSeed: "apples",
  },

  orbitModel: {
    // factor is the relative distance between levels
    // multiplier is the generated ratio between levels
    // exponent determines the distribution of love
    distanceBetweenLevels: 21,
    // this is the love scale exponent and determines how
    // love is distributed; 1 means about 1/3 at each love
    loveExponent: 1.25,
    lightColor: colors.yellow[200],
    darkColor: colors.red[400],
    planetColors: {
      1: colors.indigo[900],
      2: colors.indigo[500],
      3: colors.indigo[300],
    },
    mission: "To boldly go where no one has gone before",
  },

  visualization: {
    defaultSort: "gravity",
    defaultRevolution: 210000,
    revolutionStep: 50000,
    minRevolution: 10000,
    cycleDelay: 2000,
    firstCycleDelay: 500,
    translateOffset: 0.25,
    rings: {
      maxWidthPercentage: 0.9,
      maxHeightPercentage: 0.8,
      centerYOffset: 20,
      shapes: {
        strokeOpacityDefault: 0.2,
        strokeOpacityActive: 0.4,
        strokeOpacitySelected: 0.65,
        strokeWidth: 1.3,
        fill: backgroundColor,
        fillOpacity: 0,
      },
      labels: {
        fontSize: 15,
        fontWeight: 400,
        textYOffset: -25,
        labelStrokeOpacityDefault: 0.3,
        labelStrokeOpacitySelected: 0.4,
      },
    },
    sun: {
      radiusMaxPercentageOfWidth: 0.055,
      radiusMaxPercentageOfHeight: 0.055,
      strokeWidth: 2,
      fill: colors.orange[300],
      stroke: colors.yellow[100],
      text: {
        offset: 5,
        color: backgroundColor,
        fontWeight: 400,
        fontSize: 15,
      },
    },
    members: {
      connections: {
        stroke: colors.indigo[600],
        strokeOpacity: 1,
        strokeWidth: 1,
        strokeDashArray: "8 1 8",
      },
      label: {
        fontSize: 15,
        fontWeight: 400,
        activeOpacity: 0.65,
        activeFontWeight: 200,
      },
    },
  },

  graph: {
    defaultZoom: 0.75,

    // https://antv-g6.gitee.io/en/docs/api/graphLayout/force#layoutcfgclustering
    layout: {
      fitCenter: false,
      type: "force",
      nodeSpacing: 50,
      preventOverlap: true,
    },
    modes: {
      default: [
        { type: "drag-canvas" },
        { type: "drag-node" },
        {
          type: "zoom-canvas",
          sensitivity: 0.5,
          minZoom: 0.25,
          maxZoom: 1.25,
        },
        {
          type: "activate-relations",
          trigger: "click",
          activeState: "active",
          inactiveState: "inactive",
        },
        // this must go after activate-relations so the selected
        // node ends up with the selected state
        { type: "click-select" },
      ],
    },
    node: {
      inactiveOpacity: 0.5,
      activeOpacity: 1,
      activeLineWidth: 3,
      selectedLineWidth: 4,
      activeStroke: colors.indigo[700],
      selectedStroke: colors.indigo[700],
      fontWeight: 600,
      labelColors: {
        1: backgroundColor,
        2: backgroundColor,
        3: colors.indigo[100],
        4: colors.indigo[100],
      },
      levelSizes: {
        1: 25 * 5,
        2: 25 * 3.5,
        3: 25 * 2,
        4: 25,
      },
      labelLength: {
        1: 8,
        2: 8,
        3: 2,
        4: 1,
      },
      levelFontSizes: {
        1: 20,
        2: 16,
        3: 14,
        4: 9,
      },
    },
    edge: {
      defaultStroke: colors.indigo[800],
      activeStroke: colors.indigo[700],
      selectedLineWidth: 2,
      activeLineWidth: 2,
      inactiveOpacity: 0.65,
      activeOpacity: 1,
    },
  },
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
  fuzz: function (randValue, value, factor = 0.0) {
    var r = randValue - 0.5;
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
  getInitialNumber: (router) => {
    const queryKey = "n";
    var number =
      router.query[queryKey] ||
      router.asPath.match(new RegExp(`[&?]${queryKey}=(.*)(&|$)`));
    if (typeof number === "object") {
      if (number !== null) {
        number = parseInt(number[1]);
      }
    }
    if (!number) {
      number = 5;
    }
    return number;
  },
  formatDate: function (timestamp) {
    if (timestamp) {
      let options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };

      return new Intl.DateTimeFormat("en-US", options).format(
        new Date(timestamp)
      );
    }
  },
  formatDateShort: function (timestamp) {
    if (timestamp) {
      let options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      return new Intl.DateTimeFormat("en-US", options).format(
        new Date(timestamp)
      );
    }
  },
  onlyUnique: function (value, index, array) {
    return array.indexOf(value) === index;
  },
};

const orbitLevelColorScale = d3
  .scaleLinear()
  .range([common.orbitModel.lightColor, common.orbitModel.darkColor])
  .domain([1, 4]);

export default common;
