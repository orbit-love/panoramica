import React from "react";

import c from "lib/common";
import Controls from "components/controls";
import Member from "components/cards/member";
import OrbitLevel from "components/cards/orbit_level";
import Mission from "components/cards/mission";
import Info from "components/info";

export default function Widgets({
  members,
  setMembers,
  selection,
  setSelection,
  fullscreen,
  setFullscreen,
  animate,
  setAnimate,
  cycle,
  setCycle,
  expanded,
  setExpanded,
  showNetwork,
  setShowNetwork,
  showInfo,
  setShowInfo,
  sort,
  setSort,
}) {
  const classes = `flex space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-90`;
  return (
    <>
      <div
        className={`flex absolute bottom-0 left-0 z-10 flex-col px-4 py-5 space-y-4`}
      >
        {showInfo && members && (
          <div className={`${classes} w-96`}>
            <Info members={members} setShowInfo={setShowInfo} />
          </div>
        )}
        <div className="flex">
          <div className={`${classes} py-4 px-5 pointer-events-auto`}>
            <Controls
              animate={animate}
              setAnimate={setAnimate}
              cycle={cycle}
              setCycle={setCycle}
              fullscreen={fullscreen}
              setFullscreen={setFullscreen}
              showNetwork={showNetwork}
              setShowNetwork={setShowNetwork}
              expanded={expanded}
              setExpanded={setExpanded}
              showInfo={showInfo}
              setShowInfo={setShowInfo}
              members={members}
              setMembers={setMembers}
              sort={sort}
              setSort={setSort}
              classes={classes}
            />
          </div>
          <div className="mx-auto" />
        </div>
      </div>
      {selection && (
        <div
          className={`absolute right-0 bottom-0 z-10 px-4 py-5 w-96 pointer-events-none`}
        >
          <div
            className={`${classes} flex relative flex-col px-6 py-6 pointer-events-auto`}
          >
            {selection.level && (
              <Member
                member={selection}
                members={members}
                setSelection={setSelection}
                showNetwork={showNetwork}
                setShowNetwork={setShowNetwork}
              />
            )}
            {selection.number && (
              <OrbitLevel
                level={selection}
                members={members}
                setMembers={setMembers}
                setSelection={setSelection}
                sort={sort}
                setSort={setSort}
              />
            )}
            {selection.name === "Mission" && <Mission members={members} />}
          </div>
        </div>
      )}
    </>
  );
}
