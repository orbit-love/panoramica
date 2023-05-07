import React from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Controls({ animate, number, setNumber, setAnimate }) {
  return (
    <div className="flex justify-end">
      <div
        className={`bg-opacity-90 text-[${c.whiteColor}] bg-[${c.panelColor}] rounded`}
      >
        <div className="flex relative py-4 px-5 pointer-events-auto">
          {animate && (
            <button className="btn" onClick={() => setAnimate(false)}>
              <FontAwesomeIcon icon="pause" className="text-lg" />
            </button>
          )}
          {!animate && (
            <button className="btn" onClick={() => setAnimate(true)}>
              <FontAwesomeIcon icon="play" className="text-lg" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
