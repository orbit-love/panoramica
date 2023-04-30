import React from "react";
import Orbit1 from "components/icons/orbit_1";
import Orbit2 from "components/icons/orbit_2";
import Orbit3 from "components/icons/orbit_3";
import Orbit4 from "components/icons/orbit_4";

export default function Member({ selection }) {
  const classes = "text-indigo-700 text-xl";
  return (
    <>
      <div className="flex items-baseline space-x-2">
        <div>
          {selection.level === 1 && <Orbit1 classes={classes} />}
          {selection.level === 2 && <Orbit2 classes={classes} />}
          {selection.level === 3 && <Orbit3 classes={classes} />}
          {selection.level === 4 && <Orbit4 classes={classes} />}
        </div>
        <div className="text-xl font-bold text-indigo-700">
          {selection.name}
        </div>
      </div>
      <div className="flex flex-col my-3 space-y-2">
        <div className="text-sm font-semibold">Love: {selection.love}</div>
        <div className="text-sm font-semibold">Reach: {selection.reach}</div>
      </div>
      {selection.description && (
        <div className="my-3 text-sm leading-tight">
          {selection.description}
        </div>
      )}
    </>
  );
}
