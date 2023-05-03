import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ReachIcon({ value, classes }) {
  var markup = [];
  // var size;
  // switch (value) {
  //   case 1:
  //     size = "text-sm";
  //     break;
  //   case 2:
  //     size = "text-md";
  //     break;
  //   case 3:
  //     size = "#c7d2fe";
  // }
  markup.push(
    <FontAwesomeIcon
      key={1}
      icon="circle"
      className={"text-xs"}
      style={{ opacity: 1 }}
      title={value.toString()}
    />
  );
  markup.push(
    <FontAwesomeIcon
      key={2}
      icon="circle"
      className={"text-md"}
      style={{ opacity: value > 1 ? 1 : 0.2 }}
      title={value.toString()}
    />
  );
  markup.push(
    <FontAwesomeIcon
      key={3}
      icon="circle"
      className={"text-2xl"}
      style={{ opacity: value > 2 ? 1 : 0.2 }}
      title={value.toString()}
    />
  );
  return <div className="flex items-center space-x-1">{markup}</div>;
}
