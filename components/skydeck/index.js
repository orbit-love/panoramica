import React, { useContext, useCallback } from "react";

export { default as Frame } from "components/skydeck/frame";
export { default as Header } from "components/skydeck/header";
export { default as Scroll } from "components/skydeck/scroll";

export { default as Channel } from "components/skydeck/channel";
export { default as Channels } from "components/skydeck/channels";
export { default as Connection } from "components/skydeck/connection";
export { default as Conversation } from "components/skydeck/conversation";
export { default as Entities } from "components/skydeck/entities";
export { default as Entity } from "components/skydeck/entity";
export { default as Home } from "components/skydeck/home";
export { default as Insights } from "components/skydeck/insights";
export { default as Member } from "components/skydeck/member";
export { default as Members } from "components/skydeck/members";
export { default as Project } from "components/skydeck/project";
export { default as Prompt } from "components/skydeck/prompt";
export { default as Search } from "components/skydeck/search";
export { default as Source } from "components/skydeck/source";

export * from "components/skydeck/fetches";

import Channel from "components/skydeck/channel";
import Channels from "components/skydeck/channels";
import Connection from "components/skydeck/connection";
import Conversation from "components/skydeck/conversation";
import Entities from "components/skydeck/entities";
import Entity from "components/skydeck/entity";
import Home from "components/skydeck/home";
import Member from "components/skydeck/member";
import Members from "components/skydeck/members";
import Project from "components/skydeck/project";
import Prompt from "components/skydeck/prompt";
import Search from "components/skydeck/search";
import Source from "components/skydeck/source";

import c from "lib/common";

import {
  ProjectContext,
  ProjectDispatchContext,
} from "components/ProjectContext";

export const storageKey = "dockview_persistance_layout_2";
export const loadDefaultLayout = (api) => {
  var homePanel = api.addPanel({
    id: "home",
    component: "Home",
    tabComponent: "Home",
    title: "Home",
  });

  api.addPanel({
    id: "all-activity",
    component: "Source",
    tabComponent: "Source",
    title: "All Activity",
    position: {
      direction: "right",
    },
    params: {
      source: null,
    },
  });

  // set the size of the home panel, give it constraints, and lock it
  homePanel.api.setSize({ width: 275 });
  homePanel.group.api.setConstraints({ minimumWidth: 200, maximumWidth: 350 });
  homePanel.group.locked = true;
};

var Component = (Component, props) => {
  const context = useContext(ProjectContext);
  const dispatch = useContext(ProjectDispatchContext);
  var addWidgetFunc = addWidget(props);
  return (
    <Component
      {...props}
      addWidget={addWidgetFunc}
      {...context}
      dispatch={dispatch}
      handlers={clickHandlers(addWidgetFunc)}
    />
  );
};

// put panels in here
var imports = [
  Channel,
  Channels,
  Connection,
  Conversation,
  Entities,
  Entity,
  Home,
  Member,
  Members,
  Project,
  Prompt,
  Search,
  Source,
];
export const components = imports.reduce((memo, component) => {
  memo[component.name] = (props) => Component(component, props);
  return memo;
}, {});

import SourceIcon from "components/compact/source_icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TabComponentWithIcon = ({ api, icon }) => {
  var { title } = api;
  const onClose = useCallback(
    (event) => {
      event.stopPropagation();
      api.close();
    },
    [api]
  );

  return (
    <div className="dockview-react-tab" title={title}>
      <div className="dockview-react-tab-title max-w-[200px] overflow-x-hidden text-ellipsis whitespace-nowrap">
        {icon}
        <span className="pl-1 pr-4">{title}</span>
      </div>
      {title !== "Home" && (
        <div className="" onClick={onClose}>
          <FontAwesomeIcon icon="xmark" />
        </div>
      )}
    </div>
  );
};
export const tabComponents = {
  Home: ({ title }) => {
    return (
      <div className="dockview-react-tab">
        <div className="dockview-react-tab-title">{title}</div>
      </div>
    );
  },
  Source: ({ api, params: { source } }) => {
    var icon = source && <SourceIcon activity={{ source }} />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Conversation: ({ api }) => {
    var icon = <FontAwesomeIcon icon="messages" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Search: ({ api }) => {
    var icon = <FontAwesomeIcon icon="search" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
};

export const addWidget =
  ({ containerApi }) =>
  (id, component, params = {}) => {
    var panel = containerApi.getPanel(id);
    if (panel) {
      panel.api.setActive();
    } else {
      // lift title and position, tabComponent out for now
      var title = params.title || component.name;
      var tabComponent = params.tabComponent || component;
      var position = params.position;
      containerApi.addPanel({
        id,
        component,
        tabComponent,
        position,
        params,
        title,
      });
    }
  };

export function addMemberWidget(member, addWidget, options = {}) {
  addWidget(`member-${member.globalActor}`, "Member", {
    member,
    title: member.globalActorName,
    ...options,
  });
}

export function addSourceWidget(source, addWidget, options = {}) {
  addWidget(`source-${source}`, "Source", {
    source,
    title: source ? c.titleize(source) : "All Activity",
    ...options,
  });
}

export function addEntityWidget(entity, addWidget, options = {}) {
  addWidget(`entity-${entity.globalActor}`, "Entity", {
    entity,
    title: entity.id,
    ...options,
  });
}

export function addChannelWidget(
  source,
  sourceChannel,
  addWidget,
  options = {}
) {
  addWidget(`channel-${source}-${sourceChannel}`, "Channel", {
    source,
    sourceChannel,
    title: c.displayChannel(sourceChannel),
    tabComponent: "Source",
    ...options,
  });
}

export function addChannelsWidget(source, addWidget, options = {}) {
  addWidget(`channels-${source}`, "Channels", {
    source,
    title: "Channels",
    tabComponent: "Source",
    ...options,
  });
}

export function addActivityWidget(activity, addWidget, options = {}) {
  addWidget(`activity-${activity.id}`, "Conversation", {
    activity,
    title: "...",
    ...options,
  });
}

export const clickHandlers = (addWidget) => ({
  onClickMember: (e, member, options) => {
    e.stopPropagation();
    addMemberWidget(member, addWidget, options);
  },
  onClickSource: (e, source, options) => {
    e.stopPropagation();
    addSourceWidget(source, addWidget, options);
  },
  onClickChannel: (e, source, sourceChannel, options) => {
    e.stopPropagation();
    addChannelWidget(source, sourceChannel, addWidget, options);
  },
  onClickEntity: (e, entity, options) => {
    e.stopPropagation();
    addEntityWidget(entity, addWidget, options);
  },
  onClickChannels: (e, source, options) => {
    e.stopPropagation();
    addChannelsWidget(source, addWidget, options);
  },
  onClickConnection: (e, member, connection, options) => {
    e.stopPropagation();
    addConnectionWidget(member, connection, options);
  },
  onClickActivity: (e, activity, options) => {
    e.stopPropagation();
    addActivityWidget(activity, addWidget, options);
  },
  onClickEntity: (e, entity, options) => {
    e.stopPropagation();
    addEntityWidget(entity, addWidget, options);
  },
});
