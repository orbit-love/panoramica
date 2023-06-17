import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import c from "lib/common";
import Feed from "components/console/feed";
import Entities from "components/console/entities";

const filterActivities = ({ community, selection, connection, entity }) => {
  // filter the activities and threads based on the selection
  var activities = community.activities;

  // if it's a member
  if (selection?.actor) {
    if (connection) {
      // first get the activities that they both did
      activities = activities.filter(
        (activity) =>
          activity.globalActor === selection.globalActor ||
          activity.globalActor === connection.globalActor
      );
      // now filter out for mentions
      activities = activities.filter(
        (activity) =>
          (activity.globalActor === selection.globalActor &&
            activity.mentions?.indexOf(connection.actor) > -1) ||
          (activity.globalActor === connection.globalActor &&
            activity.mentions?.indexOf(selection.actor) > -1)
      );
    } else {
      activities = activities.filter(
        (activity) => activity.globalActor === selection.globalActor
      );
    }
    // it's an orbit level
  } else if (selection?.number) {
    activities = activities.filter(
      (activity) =>
        community.findMemberByActivity(activity)?.level === selection.number
    );
  }

  if (entity) {
    activities = activities.filter(
      (activity) => entity.activities.indexOf(activity.id) > -1
    );
  }

  return activities;
};

export default function ActivityTabs(props) {
  const { community, selection, connection, entity } = props;
  const activities = filterActivities({
    community,
    selection,
    entity,
    connection,
  });

  // classes
  var tabProps = {
    selectedClassName: "!text-indigo-100",
    className:
      "cursor-pointer text-indigo-500 px-4 font-semibold flex space-x-2 items-baseline",
  };

  return (
    <Tabs className="w-full">
      <TabList
        className={`flex fixed w-[calc(32vw-4px)] items-baseline pt-4 pb-2 bg-[${c.backgroundColor}] rounded-t-lg overflow-hidden`}
      >
        <Tab {...tabProps}>
          <span className="text-lg">Feed</span>
          <span className="font-normal text-indigo-500">
            {activities.length}
          </span>
        </Tab>
        <Tab {...tabProps}>
          <span className="text-lg">Topics</span>
          <span className="font-normal text-indigo-500">
            {community.entities.length}
          </span>
        </Tab>
      </TabList>
      <div className="pt-1 px-4 mb-1 mt-12 w-full border-b border-indigo-900" />
      <div className="">
        <TabPanel>
          <Feed {...props} activities={activities} />
        </TabPanel>
        <TabPanel className="">
          <Entities {...props} />
        </TabPanel>
      </div>
    </Tabs>
  );
}
