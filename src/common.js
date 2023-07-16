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
  colors,
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
  buttonClasses:
    "text-indigo-100 whitespace-nowrap flex-1 px-4 py-2 text-sm font-light bg-indigo-700 hover:bg-indigo-600 rounded-md select-none outline-none",
  inputClasses:
    "px-2 py-2 w-full font-normal text-sm text-black bg-indigo-100 rounded outline-none",
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
  slugify: (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, ""),
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
  onlyUnique: function (value, index, array) {
    return array.indexOf(value) === index;
  },
  diffDays: (date1, date2) => {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(date1);
    var secondDate = new Date(date2);

    var diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    return diffDays;
  },
  addDays: (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  minMaxDates: (activities) => {
    const minDate = new Date(activities[activities.length - 1].timestamp);
    const maxDate = new Date(activities[0].timestamp);
    return { minDate, maxDate };
  },
  round: (value, places = 2) => {
    return Math.floor(value * 10 ** places) / 10 ** places;
  },
  getMentions: function (text) {
    let mentions = text?.match(/@\w+/g);
    if (mentions) {
      // Remove the @ character from the mentions and de-duplicate
      let uniqueMentions = [
        ...new Set(mentions.map((mention) => mention.substring(1))),
      ];
      return uniqueMentions;
    } else {
      // Return an empty array if there were no mentions
      return [];
    }
  },
  getHashtags: function (text) {
    const hashtags = new Set(); // Use a Set to automatically ensure uniqueness
    const regex = /(#\w+)/g; // Regular expression to match hashtags
    let match;
    while ((match = regex.exec(text))) {
      // Check if the hashtag without '#' is not a number
      if (isNaN(match[1].substring(1))) {
        hashtags.add(match[1]);
      }
    }
    return Array.from(hashtags);
  },
  startOfDay: function (isoDateString) {
    const date = new Date(isoDateString);
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
  },
  endOfDay: function (isoDateString) {
    const date = new Date(isoDateString);
    date.setUTCHours(23, 59, 59, 999);
    return date.toISOString();
  },
  titleize: function (str) {
    if (str === "github") {
      return "GitHub";
    } else {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  },
  displayChannel: function (channel) {
    return channel.split("/")[1] || channel;
  },
};

export default common;
