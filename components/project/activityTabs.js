import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import c from "lib/common";
import Feed from "lib/community/feed";
import FeedComponent from "components/console/feed";

export default function ActivityTabs(props) {
  var feed = new Feed(props);
  var activities = feed.getFilteredActivities();

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
          <span className="text-lg">Activities</span>
          <span className="font-normal text-indigo-500">
            {activities.length}
          </span>
        </Tab>
        {/* <Tab {...tabProps}>
          <span className="text-lg">Topics</span>
          <span className="font-normal text-indigo-500">{entities.length}</span>
        </Tab> */}
      </TabList>
      <div className="pt-1 px-4 mb-1 mt-12 w-full border-b border-indigo-900" />
      <div className="">
        <TabPanel>
          <FeedComponent {...props} activities={activities} />
        </TabPanel>
        {/* <TabPanel className=""></TabPanel> */}
      </div>
    </Tabs>
  );
}
