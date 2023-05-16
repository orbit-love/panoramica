import React from "react";
import Orbit1 from "components/icons/orbit_1";
import Orbit2 from "components/icons/orbit_2";
import Orbit3 from "components/icons/orbit_3";
import Orbit4 from "components/icons/orbit_4";
import Meter from "components/meter";
import Prose from "components/visualization/prose";

export default function Member({ selection }) {
  const classes = "text-2xl";
  const orbitLevels = {
    1: "Orbit Level 1: Advocates",
    2: "Orbit Level 2: Contributors",
    3: "Orbit Level 3: Participants",
    4: "Orbit Level 4: Explorers",
  };
  var orbitLevelTitle = orbitLevels[selection.level];

  return (
    <Prose>
      <div className="flex items-baseline space-x-2">
        <div className="cursor-help" title={orbitLevelTitle}>
          {selection.level.number === 1 && <Orbit1 classes={classes} />}
          {selection.level.number === 2 && <Orbit2 classes={classes} />}
          {selection.level.number === 3 && <Orbit3 classes={classes} />}
          {selection.level.number === 4 && <Orbit4 classes={classes} />}
        </div>
        <div className="text-2xl font-semibold">{selection.name}</div>
      </div>
      <div className="flex flex-col my-4 space-y-2">
        <div className="flex items-center">
          <span className="w-16 font-bold text-indigo-400">Love</span>
          <Meter
            icon="square"
            number={selection.level.number}
            value={selection.love}
            classes=""
          ></Meter>
        </div>
        <div className="flex items-center">
          <span className="w-16 font-bold text-indigo-400">Reach</span>
          <Meter
            icon="square"
            number={selection.level.number}
            value={selection.reach}
            classes=""
          ></Meter>
        </div>
      </div>
      {!selection.summary && <div className="py-1" />}
      {selection.summary && (
        <div className="leading-tight">{selection.summary}</div>
      )}
    </Prose>
  );
}
