import React from "react";
import c from "lib/common";
import * as d3 from "d3";

// number is the orbit level number
export default function Meter({ number, value }) {
  var markup = [];

  const colorScale = d3
    .scaleLinear()
    .domain([0, 11])
    .range([c.indigo800, c.indigo100]);

  var activeLevel = 4 - number; // explorers = 0, etc.
  var fullSquares = activeLevel * 3 + value;
  for (var i = 1; i <= 12; i++) {
    var emptySquare = i > fullSquares;
    var squareNumberInLevel = (i - 1) % 3;
    if (squareNumberInLevel === 0) {
      markup.push(<span className="w-1" key={`top-divider-at-${i}`}></span>);
    }
    const squareStyle = {
      backgroundColor: emptySquare ? c.indigo900 : colorScale(i),
      opacity: emptySquare ? 0.65 : 1,
    };
    markup.push(<div key={i} style={squareStyle} className={`w-[17px] h-3`} />);
    if (squareNumberInLevel === 2) {
      markup.push(<span key={`divider-at-${i}`}></span>);
    }
  }

  return <div className="flex">{markup}</div>;
}
