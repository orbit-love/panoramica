import React, { useState, useEffect } from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Controls({
  animate,
  setAnimate,
  cycle,
  setCycle,
  fullscreen,
  setFullscreen,
}) {
  const animateIcon = "solar-system";
  const cycleIcon = "shuffle";
  const fullscreenIcon = "expand";

  return (
    <div className="flex justify-end">
      <div
        className={`bg-opacity-90 text-[${c.whiteColor}] bg-[${c.panelColor}] rounded`}
      >
        <div className="flex relative py-4 px-5 pointer-events-auto">
          {animate && (
            <button
              className="btn"
              onClick={() => setAnimate(false)}
              title="Rotation enabled"
            >
              <FontAwesomeIcon icon={animateIcon} className="text-lg" />
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
                className="text-lg opacity-20"
              />
            </button>
          )}
          <div className="px-2" />
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
                className="text-lg opacity-20"
              />
            </button>
          )}
          <div className="px-2" />
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
                document.body
                  .requestFullscreen()
                  .then(() => setFullscreen(true));
              }}
              title="Fullscreen disabled"
            >
              <FontAwesomeIcon
                icon={fullscreenIcon}
                className="text-lg opacity-20"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
