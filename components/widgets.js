import React, { useReducer } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import MissionControls from "components/controls/mission";
import Controls from "components/controls";
import Member from "content/cards/member";
import Steps from "components/steps";

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
}) {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const classes = `flex space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-80`;
  return (
    <>
      <div
        className={`flex absolute bottom-0 left-0 z-10 flex-col px-4 py-5 space-y-4`}
      >
        {!showNetwork && expanded && members && (
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
        <div className="flex">
          <div className={`${classes} py-4 px-5 pointer-events-auto`}>
            <Controls
              setAnimate={setAnimate}
              setCycle={setCycle}
              fullscreen={fullscreen}
              setFullscreen={setFullscreen}
              showNetwork={showNetwork}
              setShowNetwork={setShowNetwork}
              setExpanded={setExpanded}
            />
            {!showNetwork && (
              <>
                <div className="border border-indigo-900" />
                <MissionControls
                  animate={animate}
                  setAnimate={setAnimate}
                  cycle={cycle}
                  setCycle={setCycle}
                  expanded={expanded}
                  setExpanded={setExpanded}
                />
              </>
            )}
          </div>
          <div className="mx-auto" />
        </div>
      </div>
      {selection && selection.level && (
        <div
          className={`absolute right-0 bottom-0 z-10 px-4 py-5 w-96 pointer-events-none`}
        >
          <div
            className={`${classes} flex relative flex-col px-7 py-8 pointer-events-auto`}
          >
            <Member
              member={selection}
              members={members}
              setSelection={setSelection}
              setShowNetwork={setShowNetwork}
              setExpanded={setExpanded}
            />
          </div>
        </div>
      )}
      {!fullscreen && (
        <button
          className="absolute right-0 left-0 bottom-4 mx-auto w-12 text-center text-indigo-400 hover:text-indigo-200"
          onClick={scrollToIntroduction}
        >
          <FontAwesomeIcon icon="arrow-down" className="text-2xl" />
        </button>
      )}
    </>
  );
}
