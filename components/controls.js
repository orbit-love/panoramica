import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Controls({
  animate,
  setAnimate,
  cycle,
  setCycle,
  fullscreen,
  setFullscreen,
}) {
  const animateIcon = "play";
  const cycleIcon = "shuffle";
  const fullscreenIcon = "expand";

  return (
    <>
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
          <FontAwesomeIcon icon={animateIcon} className="text-lg" />
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
            setFullscreen(false);
            document.exitFullscreen();
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
