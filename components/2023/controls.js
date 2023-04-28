import React from "react";

export default function Controls({ onPlay, onPause, onChangeSize }) {
  return (
    <div className={`bg-opacity-80 w-80 bg-indigo-100 rounded`}>
      <div className="flex relative py-4 px-5 pointer-events-auto">
        <button className="btn" onClick={onPlay}>
          Play
        </button>
        <button className="btn" onClick={onPause}>
          Pause
        </button>
        <div className="mx-auto" />
        <button className="btn" onClick={onChangeSize.bind(25)}>
          25
        </button>
        <button className="btn" onClick={onChangeSize.bind(50)}>
          50
        </button>
        <button className="btn" onClick={onChangeSize.bind(100)}>
          100
        </button>
      </div>
    </div>
  );
}
