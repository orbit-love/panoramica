import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Buttons from "components/steps/buttons";

import WelcomeText from "content/steps/welcome.mdx";
import MissionText from "content/steps/mission.mdx";

import MemberO1Text from "content/steps/member-o1.mdx";
import MemberO2Text from "content/steps/member-o2.mdx";
import MemberO3Text from "content/steps/member-o3.mdx";
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

const updateMember = function ({
  members,
  setMembers,
  setSelection,
  ...changes
}) {
  const { levelNumber, love, reach } = changes;
  const member = members.find("jeri");
  members.changeLevel({ id: "jeri", levelNumber, love, reach });
  setSelection(member);
  setMembers(members);
};

const WelcomeStep = function ({ setSelection, setCycle }) {
  useEffect(() => {
    setSelection(null);
  }, [setSelection, setCycle]);

  return <WelcomeText />;
};

const MissionStep = function ({ setSelection, setCycle }) {
  useEffect(() => {
    setCycle(false);
    setSelection({ name: "Mission" });
  }, [setSelection, setCycle]);

  return <MissionText />;
};

const OrbitStep = function ({ name, icon, component, setSelection, setCycle }) {
  useEffect(() => {
    setCycle(false);
    setSelection({ name });
  }, [name, setSelection, setCycle]);

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

const MemberStep = function ({
  changes,
  component,
  members,
  setMembers,
  setSelection,
  setCycle,
}) {
  useEffect(() => {
    setCycle(false);
    setCycle(false);
    updateMember({
      ...changes,
      members,
      setMembers,
      setSelection,
    });
  }, [changes, setSelection, setCycle, members, setMembers]);

  return component;
};

const FinalStep = function ({ setSelection, setCycle }) {
  useEffect(() => {
    setCycle(false);
    setSelection(null);
  }, [setSelection, setCycle]);

  return <FinalText />;
};

export default function Steps({
  svgRef,
  members,
  setMembers,
  setSelection,
  expanded,
  setExpanded,
  step,
  setStep,
  setCycle,
}) {
  const key = 0;
  const props = {
    setCycle,
    setSelection,
    setCycle,
    svgRef,
    members,
    setMembers,
  };
  var steps = [
    <WelcomeStep key={key} {...props} />,
    <MissionStep key={(key += 1)} {...props} />,
    <OrbitStep
      name="Advocates"
      key={(key += 1)}
      icon={<Orbit1Icon />}
      component={<Orbit1Text />}
      {...props}
    />,
    <OrbitStep
      name="Contributors"
      key={(key += 1)}
      icon={<Orbit2Icon />}
      component={<Orbit2Text />}
      {...props}
    />,
    <OrbitStep
      name="Participants"
      key={(key += 1)}
      icon={<Orbit3Icon />}
      component={<Orbit3Text />}
      {...props}
    />,
    <OrbitStep
      name="Explorers"
      key={(key += 1)}
      icon={<Orbit4Icon />}
      component={<Orbit4Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      changes={{
        levelNumber: 4,
        love: 2,
        reach: 2,
      }}
      component={<MemberO4Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      changes={{
        levelNumber: 3,
        love: 1,
        reach: 1,
      }}
      component={<MemberO3Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      changes={{
        levelNumber: 2,
        love: 1,
        reach: 1,
      }}
      component={<MemberO2Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      changes={{
        levelNumber: 1,
        love: 1,
        reach: 1,
      }}
      component={<MemberO1Text />}
      {...props}
    />,
    <FinalStep key={(key += 1)} {...props} />,
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
            <Buttons
              step={step}
              setStep={setStep}
              totalSteps={totalSteps}
              setCycle={setCycle}
            />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={`mr-auto bg-opacity-90 text-[#eef2ff] bg-[#1D1640] rounded`}
      >
        <div className="flex relative py-4 px-5 pointer-events-auto">
          <button onClick={() => setExpanded(true)} className="btn">
            <FontAwesomeIcon icon="lightbulb"></FontAwesomeIcon>
          </button>
        </div>
      </div>
    );
  }
}
