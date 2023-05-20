import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function MissionControls({
  animate,
  setAnimate,
  cycle,
  setCycle,
  expanded,
  setExpanded,
}) {
  const animateIcon = "play";
  const cycleIcon = "shuffle";

  return (
    <>
      {expanded && (
        <button onClick={() => setExpanded(false)} className="btn">
          <FontAwesomeIcon
            icon="chevron-down"
            className="text-lg text-indigo-500"
          ></FontAwesomeIcon>
        </button>
      )}
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="btn">
          <FontAwesomeIcon
            icon="lightbulb"
            className="text-lg text-indigo-500"
          ></FontAwesomeIcon>
        </button>
      )}
      {animate && (
        <button
          className="btn"
          onClick={() => setAnimate(false)}
          title="Rotation enabled"
        >
          <FontAwesomeIcon icon="play" className="text-lg" />
        </button>
      )}
      {!animate && (
        <button
          className="btn"
          onClick={() => setAnimate(true)}
          title="Rotation disabled"
        >
          <FontAwesomeIcon
            icon={animateIcon}
            className="text-lg text-indigo-900"
          />
        </button>
      )}
      {cycle && (
        <button
          className="btn"
          onClick={() => setCycle(false)}
          title="Cycling through members enabled"
        >
          <FontAwesomeIcon icon={cycleIcon} className="text-lg" />
        </button>
      )}
      {!cycle && (
        <button
          className="btn"
          onClick={() => setCycle(true)}
          title="Cycling through members disabled"
        >
          <FontAwesomeIcon
            icon={cycleIcon}
            className="text-lg text-indigo-900"
          />
        </button>
      )}
    </>
  );
}
