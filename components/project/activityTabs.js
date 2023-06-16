import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import Activities from "components/console/activities";
import Threads from "components/console/threads";
import NameAndIcon from "components/compact/name_and_icon";
import Entity from "components/compact/entity";

export default function ActivityTabs(props) {
  const {
    community,
    selection,
    setSelection,
    connection,
    setConnection,
    entity,
    setEntity,
  } = props;

  // filter the activities and threads based on the selection
  var activities = community.activities;
  var title;

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
      title = (
        <>
          <NameAndIcon
            member={selection}
            setConnection={setConnection}
            selection={selection}
            setSelection={setSelection}
          />
          <FontAwesomeIcon
            icon="right-left"
            className="text-xs text-indigo-600"
          />
          <NameAndIcon
            member={connection}
            setConnection={setConnection}
            selection={selection}
            setSelection={setSelection}
          />
        </>
      );
    } else {
      activities = activities.filter(
        (activity) => activity.globalActor === selection.globalActor
      );
      title = (
        <NameAndIcon
          member={selection}
          setConnection={setConnection}
          selection={selection}
          setSelection={setSelection}
        />
      );
    }
    // it's an orbit level
  } else if (selection?.number) {
    activities = activities.filter(
      (activity) =>
        community.findMemberByActivity(activity)?.level === selection.number
    );
    title = <div>Orbit {selection.number}</div>;
  }

  if (entity) {
    title = (
      <>
        {title}
        <div className="text-xs">
          <Entity entity={entity} setEntity={setEntity} active={true} />
        </div>
      </>
    );
    activities = activities.filter(
      (activity) => entity.activities.indexOf(activity.id) > -1
    );
  }

  var threads = activities.filter(
    (activity) =>
      !activity.parent &&
      activity.children?.length > 0 &&
      !activity.sourceParentId
  );

  // only show the first 100 activities for performance reasons
  activities = activities.slice(0, 100);

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
          <span className="text-lg">Conversations</span>
          <span className="font-normal text-indigo-500">{threads.length}</span>
        </Tab>
        <Tab {...tabProps}>
          <span className="text-lg">Activities</span>
          <span className="font-normal text-indigo-500">
            {activities.length}
          </span>
        </Tab>
      </TabList>
      <div className="pt-1 px-4 mb-1 mt-12 w-full border-b border-indigo-900" />
      <div className="">
        {title && (
          <div className="flex justify-center py-2 px-4 space-x-3 w-full text-sm">
            {title}
          </div>
        )}
        <TabPanel className="">
          <Threads {...props} threads={threads} />
        </TabPanel>
        <TabPanel>
          <Activities {...props} activities={activities} />
        </TabPanel>
      </div>
    </Tabs>
  );
}
