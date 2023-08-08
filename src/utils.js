import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

const common = {
  colors,
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
  formatUnicornString: function (str, args) {
    for (const key in args) {
      str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
    }

    return str;
  },
  stringIsValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  },
  hashString: function (str) {
    let hash = 0,
      i,
      chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
  stripHtmlTags(htmlString) {
    // replace all html tags with a space
    return htmlString.replace(/<[^>]*>/g, " ");
  },
  stripMentions(string) {
    // match the apostrophe to that it and what comes after is also removed
    return string.replace(/@[\w']+/g, "");
  },
  stripLinks(string) {
    return string.replace(/https?:\/\/\S+/g, "");
  },
  stripPunctuation(string) {
    return string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  },
  stripEmojis(string) {
    return string.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    );
  },
  truncateDateToDay(isoDatetime) {
    const date = new Date(isoDatetime);
    date.setHours(0, 0, 0, 0); // Truncate time to midnight
    return date.getTime(); // Get the timestamp in milliseconds
  },
};

export default common;
