import React from "react";
import OrbitLevelIcon from "components/icons/orbit_level";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Orbit2({ classes }) {
  return (
    <OrbitLevelIcon level={2} classes={classes}>
      <FontAwesomeIcon icon="user-astronaut" className={classes} />
    </OrbitLevelIcon>
  );
}
