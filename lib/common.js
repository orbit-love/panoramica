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
  orbitLevelColorScale: (value) => orbitLevelColorScale(value),

  containerBackgroundClasses: `bg-[${backgroundColor}]`,
  panelBackgroundClasses: "bg-violet-100 text-black w-72",
  radials: 360,
  animationDelay: 250,

  initialZoomScale: 1,
  defaultOrbits: [3, 6, 11, 22],
  rAxisExponent: 1.4,

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
    distanceBetweenLevels: 23,
    // this is the love scale exponent and determines how
    // love is distributed; 1 means about 1/3 at each love
    loveExponent: 1.25,
    lightColor: "#fef08a",
    darkColor: "#92400e",
  },

  visualization: {
    defaultSort: "gravity",
    defaultRevolution: 130000,
    revolutionStep: 40000,
    minRevolution: 10000,
    cycleInterval: 2000,
    firstCycleAfter: 500,
    rings: {
      maxWidthPercentage: 0.9,
      maxHeightPercentage: 0.8,
      centerYOffset: 35,
      labels: {
        fontSize: 16,
        fontWeight: 400,
        textYOffset: 38,
        ringOpacityMultiplier: 0.25,
        ringLabelOpacityMultiplier: 0.5,
        ringStrokeWidth: 1.3,
      },
    },
    sun: {
      radiusMaxPercentageOfWidth: 0.055,
      radiusMaxPercentageOfHeight: 0.055,
      strokeWidth: 3,
      fill: colors.orange[300],
      stroke: colors.yellow[100],
      text: {
        offset: 5,
        color: backgroundColor,
        fontWeight: 600,
      },
    },
    members: {
      fontSize: 16,
      fontWeight: 400,
    },
  },

  graph: {
    inactiveOpacity: 0.35,
    activeOpacity: 1,
    defaultZoom: 0.65,

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
          minZoom: 0.5,
          maxZoom: 1.5,
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
      selectedLineWidth: 4,
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
      selectedLineWidth: 2,
      activeLineWidth: 2,
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
};

const orbitLevelColorScale = d3
  .scaleLinear()
  .range([common.orbitModel.lightColor, common.orbitModel.darkColor])
  .domain([1, 4]);

export default common;
