import React, { useEffect } from "react";
import * as d3 from "d3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import helper from "lib/orbitHelper";
import Buttons from "components/steps/buttons";

import WelcomeText from "content/steps/welcome.mdx";
import MissionText from "content/steps/mission.mdx";
import MemberO4Text from "content/steps/member-o4.mdx";
import Orbit1Text from "content/steps/orbit1.mdx";
import Orbit2Text from "content/steps/orbit2.mdx";
import Orbit3Text from "content/steps/orbit3.mdx";
import Orbit4Text from "content/steps/orbit4.mdx";
import FinalText from "content/steps/final.mdx";

import Orbit1Icon from "components/icons/orbit_1";
import Orbit2Icon from "components/icons/orbit_2";
import Orbit3Icon from "components/icons/orbit_3";
import Orbit4Icon from "components/icons/orbit_4";

const WelcomeStep = function ({ setSelection }) {
  useEffect(() => {
    setSelection(null);
  }, [setSelection]);

  return <WelcomeText />;
};

const MissionStep = function ({ setSelection }) {
  useEffect(() => {
    setSelection({ name: "Mission" });
  }, [setSelection]);

  return <MissionText />;
};

const OrbitStep = function ({ name, icon, component, setSelection }) {
  useEffect(() => {
    setSelection({ name });
  }, [name, setSelection]);

  return (
    <>
      <div className="flex items-baseline space-x-2">
        <div className="text-2xl">{icon}</div>
        <div className="text-2xl font-bold">{name}</div>
      </div>
      <div className="">{component}</div>
    </>
  );
};

const MemberO4Step = function ({ bodies, setSelection }) {
  useEffect(() => {
    const member = bodies[0];
    setSelection(member);
  }, []);

  return <MemberO4Text />;
};

const FinalStep = function ({ setSelection }) {
  useEffect(() => {
    setSelection(null);
  }, []);

  return <FinalText />;
};

export default function Steps({
  svgRef,
  bodies,
  selection,
  setSelection,
  expanded,
  setExpanded,
  step,
  setStep,
}) {
  const key = 0;
  var steps = [
    <WelcomeStep key={key} setSelection={setSelection} />,
    <MissionStep key={(key += 1)} setSelection={setSelection} />,
    <OrbitStep
      name="Advocates"
      key={(key += 1)}
      icon={<Orbit1Icon />}
      component={<Orbit1Text />}
      setSelection={setSelection}
    />,
    <OrbitStep
      name="Contributors"
      key={(key += 1)}
      icon={<Orbit2Icon />}
      component={<Orbit2Text />}
      setSelection={setSelection}
    />,
    <OrbitStep
      name="Participants"
      key={(key += 1)}
      icon={<Orbit3Icon />}
      component={<Orbit3Text />}
      setSelection={setSelection}
    />,
    <OrbitStep
      name="Explorers"
      key={(key += 1)}
      icon={<Orbit4Icon />}
      component={<Orbit4Text />}
      setSelection={setSelection}
    />,
    <MemberO4Step
      key={(key += 1)}
      bodies={bodies}
      setSelection={setSelection}
      svgRef={svgRef}
    />,
    <FinalStep key={(key += 1)} svgRef={svgRef} setSelection={setSelection} />,
  ];

  const totalSteps = steps.length;
  const stepComponent = steps[step - 1];

  if (expanded) {
    // hard code hex codes for now so tailwind builds them
    return (
      <div className={`bg-opacity-90 w-96 text-[#eef2ff] bg-[#1D1640] rounded`}>
        <div className="flex relative flex-col py-4 px-5 pointer-events-auto">
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-8"
          >
            <FontAwesomeIcon icon="chevron-down" className=""></FontAwesomeIcon>
          </button>
          <div className="flex flex-col space-y-6">
            {stepComponent}
            <Buttons step={step} setStep={setStep} totalSteps={totalSteps} />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setExpanded(true)}
          className={`pointer-events-auto text-[${c.whiteColor}] bg-[${c.panelColor}] rounded py-4 px-5`}
        >
          <FontAwesomeIcon icon="lightbulb"></FontAwesomeIcon>
        </button>
      </div>
    );
  }
}
