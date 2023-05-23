import React, { useEffect } from "react";
import * as d3 from "d3";
import c from "lib/common";

import Buttons from "components/steps/buttons";
import Prose from "components/visualization/prose";
import Orbit1Icon from "components/icons/orbit_1";
import Orbit2Icon from "components/icons/orbit_2";
import Orbit3Icon from "components/icons/orbit_3";
import Orbit4Icon from "components/icons/orbit_4";

import WelcomeText from "content/steps/welcome.mdx";
import GravityText from "content/steps/gravity.mdx";
import MissionText from "content/steps/mission.mdx";
import OrbitLevelsText from "content/steps/orbit_levels.mdx";
import Orbit1Text from "content/steps/orbit1.mdx";
import Orbit2Text from "content/steps/orbit2.mdx";
import Orbit3Text from "content/steps/orbit3.mdx";
import Orbit4Text from "content/steps/orbit4.mdx";
import MemberO11Text from "content/steps/member-o1-1.mdx";
import MemberO12Text from "content/steps/member-o1-2.mdx";
import MemberO21Text from "content/steps/member-o2-1.mdx";
import MemberO22Text from "content/steps/member-o2-2.mdx";
import MemberO3Text from "content/steps/member-o3.mdx";
import MemberO4Text from "content/steps/member-o4.mdx";
import JourneyText from "content/steps/journey.mdx";
import FinalText from "content/steps/final.mdx";

const updateMember = function ({
  memberId,
  members,
  setMembers,
  setSelection,
  ...changes
}) {
  const { levelNumber, love, reach } = changes;
  const member = members.find(memberId);
  members.changeLevel({ id: memberId, levelNumber, love, reach });
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

const GravityStep = function ({ setSelection, setCycle }) {
  useEffect(() => {
    setCycle(false);
    setSelection(null);
  }, [setSelection, setCycle]);

  return <GravityText />;
};

const OrbitLevelsStep = function ({ svgRef, setSelection, setCycle }) {
  useEffect(() => {
    setCycle(false);
    setSelection(null);
    // highlight the orbit levels; this needs to be done async
    // because the highlights will be removed on the next render
    // a better way is possible
    const timeout = setTimeout(() => {
      d3.select(svgRef.current)
        .selectAll("ellipse")
        .attr("stroke", c.selectedColor);
      d3.select(svgRef.current)
        .selectAll("text.level-label")
        .attr("fill", c.selectedColor);
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [svgRef, setSelection, setCycle]);

  return <OrbitLevelsText />;
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
  memberId,
  changes,
  component,
  members,
  setMembers,
  setSelection,
  setCycle,
  forceUpdate,
}) {
  useEffect(() => {
    setCycle(false);
    updateMember({
      ...changes,
      memberId,
      members,
      setMembers,
      setSelection,
    });
    // it's annoying we need to force an update but the selection doesn't
    // update otherwise; i'm sure there's a better way
    forceUpdate();
    // don't trigger this on subsequent re-renders or the selection
    // will always stay jeri
  }, []);

  return component;
};

const JourneyStep = function ({ setSelection, setCycle }) {
  useEffect(() => {
    setCycle(false);
    setSelection(null);
  }, [setSelection, setCycle]);

  return <JourneyText />;
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
  step,
  setStep,
  setCycle,
  scrollToIntroduction,
  forceUpdate,
}) {
  const memberId = "jeri";
  const key = 0;
  const props = {
    setCycle,
    setSelection,
    setCycle,
    svgRef,
    members,
    setMembers,
    forceUpdate,
  };
  var steps = [
    <WelcomeStep key={key} {...props} />,
    <GravityStep key={(key += 1)} {...props} />,
    <MissionStep key={(key += 1)} {...props} />,
    <OrbitLevelsStep key={(key += 1)} {...props} />,
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
      memberId={memberId}
      changes={{
        levelNumber: 4,
        love: 2,
        reach: 1,
      }}
      component={<MemberO4Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      memberId={memberId}
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
      memberId={memberId}
      changes={{
        levelNumber: 3,
        love: 2,
        reach: 3,
      }}
      component={<MemberO21Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      memberId={memberId}
      changes={{
        levelNumber: 2,
        love: 1,
        reach: 1,
      }}
      component={<MemberO22Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      memberId={memberId}
      changes={{
        levelNumber: 2,
        love: 2,
        reach: 2,
      }}
      component={<MemberO11Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      memberId={memberId}
      changes={{
        levelNumber: 1,
        love: 2,
        reach: 2,
      }}
      component={<MemberO12Text />}
      {...props}
    />,
    <JourneyStep key={(key += 1)} {...props} />,
    <FinalStep key={(key += 1)} {...props} />,
  ];

  const totalSteps = steps.length;
  const stepComponent = steps[step - 1];

  return (
    <>
      <div className="flex flex-col py-4 px-5 space-y-6 pointer-events-auto">
        <Prose>{stepComponent}</Prose>
        <Buttons
          step={step}
          setStep={setStep}
          totalSteps={totalSteps}
          setCycle={setCycle}
          scrollToIntroduction={scrollToIntroduction}
        />
      </div>
    </>
  );
}
