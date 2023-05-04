import React from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LoveIcon({ value, classes }) {
  var markup = [];
  var icon = "heart";
  var fontSize = "21px";
  markup.push(
    <FontAwesomeIcon
      key={1}
      icon={icon}
      className={classes}
      style={{
        fontSize,
        color: value === 1 ? c.indigo800 : c.indigo900,
        opacity: value === 1 ? 1 : 0.6,
      }}
    />
  );
  markup.push(
    <FontAwesomeIcon
      key={2}
      icon={icon}
      className={classes}
      style={{
        fontSize,
        color: value === 2 ? c.indigo400 : c.indigo900,
        opacity: value === 2 ? 1 : 0.6,
      }}
    />
  );
  markup.push(
    <FontAwesomeIcon
      key={3}
      icon={icon}
      className={classes}
      style={{
        fontSize,
        color: value === 3 ? c.indigo100 : c.indigo900,
        opacity: value === 3 ? 1 : 0.6,
      }}
    />
  );

  return <div className="flex space-x-[2px]">{markup}</div>;
}
