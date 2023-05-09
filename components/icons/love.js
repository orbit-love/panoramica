import React from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LoveIcon({ value, classes }) {
  var markup = [];
  var icon = "heart";
  var fontSize = "24px";
  markup.push(
    <FontAwesomeIcon
      key={1}
      icon={icon}
      className={classes}
      style={{
        fontSize,
        color: value === c.indigo100,
        opacity: 1,
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
        color: value > 1 ? c.indigo100 : c.indigo900,
        opacity: value > 1 ? 1 : 0.6,
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
        color: value > 2 ? c.indigo100 : c.indigo900,
        opacity: value > 2 ? 1 : 0.6,
      }}
    />
  );

  return <div className="flex space-x-[2px]">{markup}</div>;
}
