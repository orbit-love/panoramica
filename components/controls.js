import React from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Controls({ animate, number, setNumber, setAnimate }) {
  return (
    <div
      className={`bg-opacity-90 w-80 text-[${c.whiteColor}] bg-[${c.panelColor}] rounded`}
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
        <div className="mx-auto" />
        <button className="btn" onClick={() => setNumber(2)}>
          S
        </button>
        <button className="btn" onClick={() => setNumber(5)}>
          M
        </button>
        <button className="btn" onClick={() => setNumber(10)}>
          L
        </button>
      </div>
    </div>
  );
}
