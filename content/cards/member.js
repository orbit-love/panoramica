import React from "react";
import Orbit1 from "components/icons/orbit_1";
import Orbit2 from "components/icons/orbit_2";
import Orbit3 from "components/icons/orbit_3";
import Orbit4 from "components/icons/orbit_4";
import Love from "components/icons/love";
import Reach from "components/icons/reach";

export default function Member({ selection }) {
  const classes = "text-2xl";
  return (
    <>
      <div className="flex items-baseline space-x-2">
        <div>
          {selection.level === 1 && <Orbit1 classes={classes} />}
          {selection.level === 2 && <Orbit2 classes={classes} />}
          {selection.level === 3 && <Orbit3 classes={classes} />}
          {selection.level === 4 && <Orbit4 classes={classes} />}
        </div>
        <div className="text-xl font-semibold">{selection.name}</div>
      </div>
      <div className="flex items-center my-4 space-x-6 text-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold">Love</span>
          <Love value={selection.love} classes=""></Love>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold">Reach</span>
          <Reach value={selection.reach} classes=""></Reach>
        </div>
      </div>
      {selection.description && (
        <div className="text-sm leading-tight">{selection.description}</div>
      )}
    </>
  );
}
