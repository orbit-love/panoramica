import React from "react";
import moment from "moment";

export default function TimeControl({
  minDate,
  maxDate,
  timer,
  setTimer,
  selectMemberId,
  animate,
  setAnimate,
}) {
  const previousWeek = () => {
    const d = moment(timer);
    d.subtract(1, "weeks");
    setTimer(d);
  };
  const playAnimation = () => {
    if (timer.isSame(maxDate)) {
      setTimer(minDate);
    }
    setAnimate(true);
  };
  const pauseAnimation = () => {
    setAnimate(false);
  };
  const resetTimer = () => {
    setTimer(maxDate);
    selectMemberId(null);
  };

  const nextWeek = () => {
    const d = moment(timer);
    d.add(1, "weeks");
    setTimer(d);
  };

  return (
    <>
      <div className="flex space-x-2 w-48">
        {!timer.isSame(minDate) && (
          <button className="btn btn-slate w-20" onClick={previousWeek}>
            &lsaquo; {moment(timer).subtract(1, "week").format("MMM D")}
          </button>
        )}
        {!timer.isSame(maxDate) && (
          <button className="btn btn-slate w-20" onClick={nextWeek}>
            {moment(timer).add(1, "week").format("MMM D")} &rsaquo;
          </button>
        )}
      </div>
      <div className="flex space-x-2">
        {!animate && (
          <button className="btn btn-purple" onClick={playAnimation}>
            Play
          </button>
        )}
        {animate && (
          <button className="btn btn-purple" onClick={pauseAnimation}>
            Pause
          </button>
        )}
        {
          <button className="btn btn-slate" onClick={resetTimer}>
            Reset
          </button>
        }
      </div>
    </>
  );
}
