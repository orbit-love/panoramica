import React from "react";

import c from "lib/common";
import Controls from "components/controls";
import Member from "components/cards/member";
import OrbitLevel from "components/cards/orbit_level";
import Mission from "components/cards/mission";
import Info from "components/info";
import List from "components/simulator/list";
import ActivitiesConsole from "components/simulator/activitiesConsole";

export default function Widgets({
  community,
  setCommunity,
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
  levels,
  simulation,
  simulations,
  setSimulation,
  setSimulations,
  showPanel,
  setShowPanel,
  low,
  setLow,
  high,
  setHigh,
}) {
  const classes = `flex space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-90`;
  return (
    <>
      <div
        className={`flex absolute bottom-0 left-0 z-10 flex-col px-4 py-5 space-y-4`}
      >
        {showInfo && (
          <div className={`${classes} w-96`}>
            <Info community={community} setShowInfo={setShowInfo} />
          </div>
        )}
        {showPanel && (
          <div className={`${classes} w-96`}>
            <List
              community={community}
              setCommunity={setCommunity}
              levels={levels}
              sort={sort}
              simulation={simulation}
              setSimulation={setSimulation}
              simulations={simulations}
              setSimulations={setSimulations}
              setSelection={setSelection}
              low={low}
              setLow={setLow}
              high={high}
              setHigh={setHigh}
            />
          </div>
        )}
        <div className="flex">
          <div className={`${classes} py-4 px-5 pointer-events-auto`}>
            <Controls
              levels={levels}
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
              showPanel={showPanel}
              setShowPanel={setShowPanel}
              community={community}
              setCommunity={setCommunity}
              sort={sort}
              setSort={setSort}
              classes={classes}
            />
          </div>
          {community && selection && (
            <div
              className={`absolute bottom-6 left-96 ml-10 z-50 flex items-center justify-center bg-[${c.backgroundColor}] bg-opacity-90`}
            >
              <div className="overflow-scroll relative pr-2 h-[250px] rounded-md border border-indigo-700">
                <ActivitiesConsole
                  selection={selection}
                  setSelection={setSelection}
                  community={community}
                  low={low}
                  high={high}
                />
              </div>
            </div>
          )}
          <div className="mx-auto" />
        </div>
      </div>
      {selection && community && (
        <div
          className={`absolute right-0 bottom-0 z-10 px-4 py-5 w-96 pointer-events-none`}
        >
          <div
            className={`${classes} flex relative flex-col px-6 py-6 pointer-events-auto`}
          >
            {typeof selection.level === "number" && (
              <Member
                member={
                  community.members.find(
                    (member) => selection.id === member.id
                  ) || selection
                }
                community={community}
                setSelection={setSelection}
                showNetwork={showNetwork}
                setShowNetwork={setShowNetwork}
                levels={levels}
              />
            )}
            {selection.number && (
              <OrbitLevel
                level={selection}
                levels={levels}
                community={community}
                setCommunity={setCommunity}
                setSelection={setSelection}
                sort={sort}
                setSort={setSort}
              />
            )}
            {selection.name === "Mission" && (
              <Mission
                community={community}
                setSelection={setSelection}
                sort={sort}
                setSort={setSort}
                levels={levels}
                setCommunity={setCommunity}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
