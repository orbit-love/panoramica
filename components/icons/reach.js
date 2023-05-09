import React from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ReachIcon({ value }) {
  var markup = [];
  var selectedColor = c.indigo400;
  markup.push(
    <FontAwesomeIcon
      key={1}
      icon="circle"
      style={{ opacity: 1, color: selectedColor, fontSize: "12px" }}
    />
  );
  markup.push(
    <FontAwesomeIcon
      key={2}
      icon="circle"
      style={{
        opacity: value > 1 ? 1 : 0.6,
        fontSize: "18px",
        color: value > 1 ? selectedColor : c.indigo900,
      }}
    />
  );
  markup.push(
    <FontAwesomeIcon
      key={3}
      icon="circle"
      style={{
        opacity: value > 2 ? 1 : 0.6,
        fontSize: "25px",
        color: value == 3 ? selectedColor : c.indigo900,
      }}
    />
  );
  return <div className="flex items-center space-x-[2px]">{markup}</div>;
}
