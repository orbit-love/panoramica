import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function OrbitLevelIcon({ level, classes, children }) {
  return (
    <>
      {/* {children} */}
      <FontAwesomeIcon icon={`circle-${level}`} className={classes} />
    </>
  );
}
