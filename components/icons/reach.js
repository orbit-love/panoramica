import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ReachIcon({ value, classes }) {
  var markup = [];
  for (var i = 0; i < value; i++) {
    markup.push(
      <FontAwesomeIcon
        key={i}
        icon="chart-network"
        className={classes}
        title={value.toString()}
      />
    );
  }
  for (var i = 0; i < 3 - value; i++) {
    markup.push(
      <FontAwesomeIcon
        key={i}
        icon="chart-network"
        className={classes + " opacity-20"}
        title={value.toString()}
      />
    );
  }
  return <div className="flex space-x-1">{markup}</div>;
}
