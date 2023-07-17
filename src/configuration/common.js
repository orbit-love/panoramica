import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

const common = {
  colors,
  buttonClasses:
    "text-indigo-100 whitespace-nowrap flex-1 px-4 py-2 text-sm font-light bg-indigo-700 hover:bg-indigo-600 rounded-md select-none outline-none",
  inputClasses:
    "px-2 py-2 w-full font-normal text-sm text-black bg-indigo-100 rounded outline-none",
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
