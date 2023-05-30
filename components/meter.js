import React from "react";
import c from "lib/common";
import * as d3 from "d3";

// number is the orbit level number
export default function Meter({ number, value, relative }) {
  var markup = [];
  var scaledValue = c.scale123(value);

  const colorScale = d3
    .scaleLinear()
    .domain([0, 11])
    .range([c.indigo800, c.indigo100]);

  var activeLevel = 4 - number; // explorers = 0, etc.
  var fullSquares = activeLevel * 3 + scaledValue;
  for (var i = 1; i <= 12; i++) {
    var emptySquare = i > fullSquares;
    var squareInLevel = Math.floor((i - 1) / 3);
    if (relative && activeLevel !== squareInLevel) continue;
    var squarePositionInLevel = (i - 1) % 3;
    if (squarePositionInLevel === 0) {
      markup.push(<span className="w-1" key={`top-divider-at-${i}`}></span>);
    }
    const squareStyle = {
      backgroundColor: emptySquare ? c.indigo900 : colorScale(i),
      opacity: emptySquare ? 0.65 : 1,
    };
    markup.push(<div key={i} style={squareStyle} className={`w-[17px] h-3`} />);
    if (squarePositionInLevel === 2) {
      markup.push(<span key={`divider-at-${i}`}></span>);
    }
  }

  return <div className="flex">{markup}</div>;
}
