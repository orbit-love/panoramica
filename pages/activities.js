import React from "react";
import { faker } from "@faker-js/faker";

import c from "lib/common";
import Head from "components/head";
import MemberGeneratorLight from "data/memberGeneratorLight";
import ActivityGenerator from "data/activityGenerator";
import levelsData from "data/levels";

export default function Activities() {
  var seed = c.cyrb128("apples");
  var rand = c.mulberry32(seed[0]);
  faker.seed(seed);

  const numMembers = 5;
  const numActivities = 20;

  const levels = levelsData;

  // create some initial members
  const memberGenerator = new MemberGeneratorLight({ levels });
  const members = memberGenerator.produceMembers({ number: numMembers });

  // create a generator with these members
  const activityGenerator = new ActivityGenerator({ rand, members });

  const activities = [];
  for (var i = 0; i < numActivities; i++) {
    activities.push(activityGenerator.produceActivity({}));
  }

  return (
    <>
      <Head />
      {activities.map((activity, index) => (
        <div key={index} className="flex m-4 space-x-2">
          <div>{index}</div>
          <div>{activity.member?.name}</div>
          <div>{activity.activityType?.name}</div>
          {/* <div>{activity.timestamp.toISOString()}</div> */}
        </div>
      ))}
    </>
  );
}
