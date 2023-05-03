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
  for (var i = 0; i < 3; i++) {
    markup.push(
      <FontAwesomeIcon
        key={i}
        icon="circle"
        className={classes}
        style={{ color, opacity: value > i ? 1 : 0.2 }}
        title={value.toString()}
      />
    );
  }

  return <div className="flex space-x-1">{markup}</div>;
}
