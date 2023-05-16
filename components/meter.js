import React from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// number is the orbit level number
export default function Meter({
  icon = "square",
  fontSize = "14px",
  number,
  value,
  classes,
}) {
  var markup = [];

  var fullProps = {
    fontSize,
    color: c.indigo100,
  };
  var emptyProps = {
    fontSize,
    color: c.indigo900,
  };

  var activeLevel = 4 - number; // explorers = 0, etc.
  var fullSquares = activeLevel * 3 + value;
  for (var i = 1; i <= 12; i++) {
    var styleProps = i >= fullSquares ? emptyProps : fullProps;
    var squareLevel = Math.floor((i - 1) / 3); // what ol are we in? {0..3}
    var inActiveLevel = squareLevel === activeLevel;
    var opacity = 1; // inActiveLevel ? 1 : 0.8;
    var squareNumberInLevel = (i - 1) % 3;
    if (inActiveLevel && squareNumberInLevel === 0) {
      markup.push(
        <span key={`top-divider-at-${i}`} className="w-[2px]"></span>
      );
    }
    markup.push(
      <FontAwesomeIcon
        key={i}
        icon={icon}
        className={classes}
        style={{ ...styleProps, opacity }}
      />
    );
    if (inActiveLevel && squareNumberInLevel === 2) {
      markup.push(<span key={`divider-at-${i}`} className="w-[2px]"></span>);
    }
  }

  return <div className="flex space-x-[2px]">{markup}</div>;
}
