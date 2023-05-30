import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as d3 from "d3";
import c from "lib/common";
import helper from "lib/memberGraph/helper";

import Buttons from "components/steps/buttons";
import Prose from "components/visualization/prose";
import OrbitLevelIcon from "components/icons/orbit_level";

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
  setData,
  sort,
  ...changes
}) {
  const { levelNumber, love, connections } = changes;
  const member = members.find(memberId);

  // get how many connections the member currently has
  // and compute how many more we need to add
  const currentConnections = members.getConnectionSetKeys(member);
  const numberNewConnections = connections - currentConnections.length;

  // if we need to reduce connections, just go through existing ones
  // and remove them from the set
  if (numberNewConnections < 0) {
    for (var i = 0; i < Math.abs(numberNewConnections); i++) {
      members.connections.delete(currentConnections[i]);
    }
  }

  // if we need to add connections
  if (numberNewConnections > 0) {
    // get an array for finding new potential connections
    const unpackedMembers = members.getUnpackedMembers();
    // track the new connections so we now how many
    const newConnections = [];

    while (newConnections.length < numberNewConnections) {
      const potentialConnection =
        members.connectionGenerator.getRandomMember(unpackedMembers);
      const isSelf = potentialConnection.id === member.id;
      const setKey = members.connectionGenerator.setKey(
        member,
        potentialConnection
      );
      const isConnected = members.connections.has(setKey);
      if (!isSelf && !isConnected) {
        newConnections.push(setKey);
      }
    }

    // add the new connections to the global set array
    newConnections.forEach((setKey) => members.connections.add(setKey));
  }

  if (levelNumber !== member.level.number) {
    members.changeLevel({ id: memberId, levelNumber, love });
  }
  setSelection(member);
  // prepare members so it's right for all components
  // on the next render
  members.prepareToRender({ sort });
  setMembers(members);
  // calling set members and listening to the change in member
  // graph didn't work, we have to call setData here for the graph
  // to pick it up; not ideal but hopefully fixable
  setData(helper.getData({ members }));
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
      d3.select(svgRef.current).selectAll("ellipse").attr("stroke-opacity", 1);
      d3.select(svgRef.current)
        .selectAll("text.level-label")
        .attr("opacity", 1);
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [svgRef, setSelection, setCycle]);

  return <OrbitLevelsText />;
};

const OrbitStep = function ({
  name,
  number,
  icon,
  component,
  level,
  setSelection,
  setCycle,
}) {
  useEffect(() => {
    setCycle(false);
    setSelection(level);
  }, [name, level, setSelection, setCycle]);

  return (
    <>
      <div className="flex items-baseline space-x-2">
        <div className="text-2xl">{icon}</div>
        <div
          className="text-2xl font-bold"
          style={{ color: c.orbitLevelColorScale(number) }}
        >
          {name}
        </div>
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
  setData,
  sort,
}) {
  useEffect(() => {
    setCycle(false);
    updateMember({
      ...changes,
      memberId,
      members,
      setMembers,
      setSelection,
      setData,
      sort,
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
  levels,
  setMembers,
  setSelection,
  step,
  setStep,
  setCycle,
  setExpanded,
  scrollToIntroduction,
  forceUpdate,
  data,
  setData,
  sort,
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
    data,
    setData,
    sort,
  };
  var steps = [
    <WelcomeStep key={key} {...props} />,
    <GravityStep key={(key += 1)} {...props} />,
    <MissionStep key={(key += 1)} {...props} />,
    <OrbitLevelsStep key={(key += 1)} {...props} />,
    <OrbitStep
      name="Advocates"
      number={1}
      level={levels[1]}
      key={(key += 1)}
      icon={<OrbitLevelIcon number={1} />}
      component={<Orbit1Text />}
      {...props}
    />,
    <OrbitStep
      name="Contributors"
      number={2}
      level={levels[2]}
      key={(key += 1)}
      icon={<OrbitLevelIcon number={2} />}
      component={<Orbit2Text />}
      {...props}
    />,
    <OrbitStep
      name="Participants"
      number={3}
      level={levels[3]}
      key={(key += 1)}
      icon={<OrbitLevelIcon number={3} />}
      component={<Orbit3Text />}
      {...props}
    />,
    <OrbitStep
      name="Explorers"
      number={4}
      level={levels[4]}
      key={(key += 1)}
      icon={<OrbitLevelIcon number={4} />}
      component={<Orbit4Text />}
      {...props}
    />,
    <MemberStep
      key={(key += 1)}
      memberId={memberId}
      changes={{
        levelNumber: 4,
        love: 2,
        connections: 1,
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
        connections: 3,
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
        connections: 4,
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
        connections: 5,
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
        connections: 8,
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
        connections: 10,
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
      <div className="flex relative flex-col py-4 px-5 space-y-4 pointer-events-auto">
        <Prose>{stepComponent}</Prose>
        <button
          className="absolute top-0 right-6 text-lg"
          onClick={() => setExpanded(false)}
        >
          <FontAwesomeIcon icon="xmark" />
        </button>
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
