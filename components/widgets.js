import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import Controls from "components/controls";
import Member from "components/cards/member";
import OrbitLevel from "components/cards/orbit_level";
import Steps from "components/steps";
import Info from "components/info";

export default function Widgets({
  svgRef,
  members,
  setMembers,
  selection,
  setSelection,
  step,
  setStep,
  fullscreen,
  setFullscreen,
  animate,
  setAnimate,
  cycle,
  setCycle,
  expanded,
  setExpanded,
  scrollToIntroduction,
  showNetwork,
  setShowNetwork,
  showInfo,
  setShowInfo,
  sort,
  setSort,
  forceUpdate,
  data,
  setData,
  levels,
}) {
  const classes = `flex space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-90`;
  return (
    <>
      <div
        className={`flex absolute bottom-0 left-0 z-10 flex-col px-4 py-5 space-y-4`}
      >
        {expanded && members && (
          <div className={`${classes} w-96`}>
            <Steps
              svgRef={svgRef}
              selection={selection}
              setSelection={setSelection}
              members={members}
              setMembers={setMembers}
              setExpanded={setExpanded}
              step={step}
              setStep={setStep}
              setCycle={setCycle}
              scrollToIntroduction={scrollToIntroduction}
              forceUpdate={forceUpdate}
              data={data}
              setData={setData}
              levels={levels}
            />
          </div>
        )}
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
              sort={sort}
              setSort={setSort}
              classes={classes}
            />
          </div>
          <div className="mx-auto" />
        </div>
      </div>
      {selection && (selection.level || selection.number) && (
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
                setShowNetwork={setShowNetwork}
              />
            )}
            {selection.number && (
              <OrbitLevel
                level={selection}
                members={members}
                setSelection={setSelection}
              />
            )}
          </div>
        </div>
      )}
      {!fullscreen && (
        <button
          className="absolute right-0 left-0 bottom-2 mx-auto w-12 text-center text-indigo-800 hover:text-indigo-600"
          onClick={scrollToIntroduction}
        >
          <FontAwesomeIcon icon="arrow-down" className="text-xl" />
        </button>
      )}
    </>
  );
}
