import React from "react";
import OrbitLevelIcon from "components/icons/orbit_level";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Orbit3({ classes }) {
  return (
    <OrbitLevelIcon level={3} classes={classes}>
      <FontAwesomeIcon icon="user-astronaut" className={classes} />
    </OrbitLevelIcon>
  );
}
