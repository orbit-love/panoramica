import React from "react";
import Orbit1 from "components/icons/orbit_1";
import Orbit2 from "components/icons/orbit_2";
import Orbit3 from "components/icons/orbit_3";
import Orbit4 from "components/icons/orbit_4";
import Meter from "components/meter";
import Prose from "components/visualization/prose";

export default function Member({ selection }) {
  const classes = "text-2xl";
  const messages = {
    1: "Low love relative to others in their orbit level",
    2: "Average love relative to others in their orbit level",
    3: "High love relative to others in their orbit level",
  };
  var loveTitle = messages[selection.love];
  var reachTitle = messages[selection.reach].replace("love", "reach");
  const orbitLevels = {
    1: "Orbit Level 1: Advocates",
    2: "Orbit Level 2: Contributors",
    3: "Orbit Level 3: Participants",
    4: "Orbit Level 4: Explorers",
  };
  var orbitLevelTitle = orbitLevels[selection.level];

  var summary;
  if (selection.love === 3 && selection.reach === 1) {
    summary = `${selection.name} has high love and low reach relative to others in their orbit level. Help ${selection.name} meet other members and grow their network.`;
  }
  if (selection.love === 1 && selection.reach === 3) {
    summary = `${selection.name} has high reach and low love relative to others in their orbit level. Help ${selection.name} find deeper and more frequent ways to contribute.`;
  }
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
        <div title={loveTitle} className="flex items-center cursor-help">
          <span className="w-16 font-bold text-indigo-400">Love</span>
          <Meter
            icon="square"
            number={selection.level.number}
            value={selection.love}
            classes=""
          ></Meter>
        </div>
        <div title={reachTitle} className="flex items-center cursor-help">
          <span className="w-16 font-bold text-indigo-400">Reach</span>
          <Meter
            icon="square"
            number={selection.level.number}
            value={selection.reach}
            classes=""
          ></Meter>
        </div>
      </div>
      {!summary && <div className="py-1" />}
      {summary && <div className="leading-tight">{summary}</div>}
    </Prose>
  );
}
