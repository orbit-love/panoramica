import React from "react";

import c from "lib/common";
import Controls from "components/controls";
import Member from "components/cards/member";
import OrbitLevel from "components/cards/orbit_level";
import Mission from "components/cards/mission";
import Info from "components/info";
import List from "components/simulator/list";
import Activities from "components/simulator/console/activities";

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
  const width = "w-[31vw]";
  const height = "h-[40vh]";
  const classes = `flex ${height} px-4 py-3 overflow-scroll space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-90`;

  const DControls = () => (
    <div className={`flex absolute top-0 right-0 z-10 p-5 space-x-4`}>
      <div className={`${classes} py-4 px-5 h-auto pointer-events-auto`}>
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
    </div>
  );

  return (
    <>
      <DControls />
      <div
        className={`w-[100vw] flex absolute bottom-0 left-0 z-10 justify-between p-5 space-x-4`}
      >
        {showPanel && (
          <>
            {showInfo && (
              <div className={`${classes} ${width}`}>
                <Info community={community} setShowInfo={setShowInfo} />
              </div>
            )}
            {!showInfo && (
              <div className={`${classes} ${width}`}>
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
            {community && selection && (
              <div className={`${classes} ${width} !p-0`}>
                <Activities
                  selection={selection}
                  setSelection={setSelection}
                  community={community}
                  low={low}
                  high={high}
                />
              </div>
            )}
            {community && selection && (
              <div
                className={`${classes} ${width} flex relative flex-col pointer-events-auto`}
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
            )}
          </>
        )}
      </div>
    </>
  );
}
