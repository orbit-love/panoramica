import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LoveIcon({ value, classes }) {
  var markup = [];
  var color;
  switch (value) {
    case 1:
      color = "#312e81";
      break;
    case 2:
      color = "#6366f1";
      break;
    case 3:
      color = "#c7d2fe";
  }
  markup.push(
    <FontAwesomeIcon
      key={1}
      icon="circle"
      className={classes}
      style={{ color, opacity: 1 }}
      title={value.toString()}
    />
  );
  markup.push(
    <FontAwesomeIcon
      key={2}
      icon="circle"
      className={classes}
      style={{ color, opacity: value > 1 ? 1 : 0.2 }}
      title={value.toString()}
    />
  );
  markup.push(
    <FontAwesomeIcon
      key={3}
      icon="circle"
      className={classes}
      style={{ color, opacity: value > 2 ? 1 : 0.2 }}
      title={value.toString()}
    />
  );

  return <div className="flex space-x-1">{markup}</div>;
}
