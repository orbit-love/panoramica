import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ReachIcon({ value, classes }) {
  var icons = 1;
  if (value > 0.8) icons = 2;
  if (value > 1.4) icons = 3;
  var markup = [];
  for (var i = 0; i < icons; i++) {
    markup.push(
      <FontAwesomeIcon
        key={i}
        icon="signal-stream"
        className={classes}
        title={value.toString()}
      />
    );
  }
  return <div className="flex space-x-1">{markup}</div>;
}
