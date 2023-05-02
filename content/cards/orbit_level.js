import React from "react";
import Orbit1 from "components/icons/orbit_1";
import Orbit2 from "components/icons/orbit_2";
import Orbit3 from "components/icons/orbit_3";
import Orbit4 from "components/icons/orbit_4";

export default function OrbitLevel({ selection }) {
  const classes = "text-xl";
  return (
    <>
      <div className="flex items-baseline space-x-2">
        <div>
          {selection.number === 1 && <Orbit1 classes={classes} />}
          {selection.number === 2 && <Orbit2 classes={classes} />}
          {selection.number === 3 && <Orbit3 classes={classes} />}
          {selection.number === 4 && <Orbit4 classes={classes} />}
        </div>
        <div className="text-xl font-bold">{selection.name}</div>
      </div>
      {selection.description && (
        <div className="my-3 text-sm font-light leading-tight">
          {selection.description}
        </div>
      )}
    </>
  );
}
