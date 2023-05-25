import React, { useReducer } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import Controls from "components/controls";
import Member from "components/cards/member";
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
}) {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

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
              step={step}
              setStep={setStep}
              setCycle={setCycle}
              scrollToIntroduction={scrollToIntroduction}
              forceUpdate={forceUpdate}
            />
          </div>
        )}
        {showInfo && members && (
          <div className={`${classes} w-96`}>
            <Info members={members} />
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
            />
          </div>
          <div className="mx-auto" />
        </div>
      </div>
      {selection && selection.level && (
        <div
          className={`absolute right-0 bottom-0 z-10 px-4 py-5 w-96 pointer-events-none`}
        >
          <div
            className={`${classes} flex relative flex-col px-6 py-6 pointer-events-auto`}
          >
            <Member
              member={selection}
              members={members}
              setShowNetwork={setShowNetwork}
            />
          </div>
        </div>
      )}
      {!fullscreen && (
        <button
          className="absolute right-0 left-0 bottom-4 mx-auto w-12 text-center text-indigo-700 hover:text-indigo-200"
          onClick={scrollToIntroduction}
        >
          <FontAwesomeIcon icon="arrow-down" className="text-2xl" />
        </button>
      )}
    </>
  );
}
