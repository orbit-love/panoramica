import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Controls({
  animate,
  setAnimate,
  cycle,
  setCycle,
  fullscreen,
  setFullscreen,
  expanded,
  setExpanded,
  showInfo,
  setShowInfo,
}) {
  const fullscreenIcon = "expand";
  const cycleIcon = "shuffle";
  const infoIcon = "question";

  return (
    <>
      {expanded && (
        <button onClick={() => setExpanded(false)} className="btn">
          <FontAwesomeIcon
            icon="lightbulb"
            className="text-lg"
          ></FontAwesomeIcon>
        </button>
      )}
      {!expanded && (
        <button
          onClick={() => {
            setShowInfo(false);
            setExpanded(true);
          }}
          className="btn"
        >
          <FontAwesomeIcon
            icon="lightbulb"
            className="text-lg text-indigo-500"
          ></FontAwesomeIcon>
        </button>
      )}
      {showInfo && (
        <button onClick={() => setShowInfo(false)} className="btn">
          <FontAwesomeIcon
            icon={infoIcon}
            className="text-lg"
          ></FontAwesomeIcon>
        </button>
      )}
      {!showInfo && (
        <button
          onClick={() => {
            setExpanded(false);
            setShowInfo(true);
          }}
          className="btn"
        >
          <FontAwesomeIcon
            icon={infoIcon}
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
          <FontAwesomeIcon icon="pause" className="text-lg" />
        </button>
      )}
      {!animate && (
        <button
          className="btn"
          onClick={() => setAnimate(true)}
          title="Rotation disabled"
        >
          <FontAwesomeIcon icon="play" className="text-lg text-indigo-900" />
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
      {fullscreen && (
        <button
          className="btn"
          onClick={() => {
            document.exitFullscreen().then(() => setFullscreen(false));
          }}
          title="Fullscreen"
        >
          <FontAwesomeIcon icon={fullscreenIcon} className="text-lg" />
        </button>
      )}
      {!fullscreen && (
        <button
          className="btn"
          onClick={() => {
            document.body.requestFullscreen().then(() => setFullscreen(true));
          }}
          title="Fullscreen disabled"
        >
          <FontAwesomeIcon
            icon={fullscreenIcon}
            className="text-lg text-indigo-900"
          />
        </button>
      )}
    </>
  );
}
