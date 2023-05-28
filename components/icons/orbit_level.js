import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c from "lib/common";

export default function OrbitLevelIcon({ number, classes }) {
  const color = c.orbitLevelColorScale(number);
  return (
    <FontAwesomeIcon
      icon={`circle-${number}`}
      className={classes}
      style={{
        color,
      }}
    />
  );
}
