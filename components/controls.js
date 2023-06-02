import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sorter from "components/sorter";

export default function Controls({
  animate,
  setAnimate,
  cycle,
  setCycle,
  fullscreen,
  setFullscreen,
  showInfo,
  setShowInfo,
  sort,
  setSort,
  members,
  setMembers,
  classes,
}) {
  const fullscreenIcon = "expand";
  const cycleIcon = "shuffle";
  const infoIcon = "question";
  const sortIcon = "sort";
  const buttonClasses = "btn select-none outline-none";

  const [sortOpen, setSortOpen] = useState(false);

  return (
    <>
      {showInfo && (
        <button onClick={() => setShowInfo(false)} className={buttonClasses}>
          <FontAwesomeIcon
            icon={infoIcon}
            className="text-lg"
          ></FontAwesomeIcon>
        </button>
      )}
      {!showInfo && (
        <button
          onClick={() => {
            setShowInfo(true);
          }}
          className={buttonClasses}
        >
          <FontAwesomeIcon
            icon={infoIcon}
            className="text-lg text-indigo-500"
          ></FontAwesomeIcon>
        </button>
      )}
      <div className="relative">
        <button
          className={buttonClasses}
          onClick={() => setSortOpen(!sortOpen)}
          title="Sort"
        >
          <FontAwesomeIcon
            icon={sortIcon}
            className={`text-lg ${sortOpen ? "text-white" : "text-indigo-500"}`}
          />
        </button>
        {sortOpen && (
          <Sorter
            sort={sort}
            setSort={setSort}
            setSortOpen={setSortOpen}
            members={members}
            setMembers={setMembers}
            classes={classes}
          />
        )}
      </div>
      <div className="flex px-2">
        <div className="w-[1px] bg-indigo-900" />
      </div>
      {animate && (
        <button
          className={buttonClasses}
          onClick={() => setAnimate(false)}
          title="Rotation enabled"
        >
          <FontAwesomeIcon icon="pause" className="text-lg" />
        </button>
      )}
      {!animate && (
        <button
          className={buttonClasses}
          onClick={() => setAnimate(true)}
          title="Rotation disabled"
        >
          <FontAwesomeIcon icon="play" className="text-lg text-indigo-900" />
        </button>
      )}
      {cycle && (
        <button
          className={buttonClasses}
          onClick={() => setCycle(false)}
          title="Cycling through members enabled"
        >
          <FontAwesomeIcon icon={cycleIcon} className="text-lg" />
        </button>
      )}
      {!cycle && (
        <button
          className={buttonClasses}
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
          className={buttonClasses}
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
          className={buttonClasses}
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
