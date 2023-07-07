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
export const tabComponents = {
  Home: ({ title }) => {
    return (
      <div className="dockview-react-tab">
        <div className="dockview-react-tab-title">{title}</div>
      </div>
    );
  },
  Source: ({ api, params: { source } }) => {
    var { title } = api;
    const onClose = useCallback(
      (event) => {
        event.stopPropagation();
        api.close();
      },
      [api]
    );

    return (
      <div className="dockview-react-tab">
        <div className="dockview-react-tab-title">
          {source && <SourceIcon activity={{ source, title }} />}
          <span className="pl-1 pr-4">{title}</span>
        </div>
        {title !== "Home" && (
          <div className="" onClick={onClose}>
            <FontAwesomeIcon icon="xmark" />
          </div>
        )}
      </div>
    );
  },
};

export const addWidget =
  ({ containerApi }) =>
  (id, component, params = {}) => {
    var panel = containerApi.getPanel(id);
    if (panel) {
      panel.api.setActive();
    } else {
      // lift title out for now
      var title = params.title || component.name;
      containerApi.addPanel({
        id,
        component,
        tabComponent: component,
        params,
        title,
      });
    }
  };

export function addMemberWidget(member, addWidget) {
  addWidget(`member-${member.globalActor}`, "Member", {
    member,
    title: member.globalActorName,
  });
}

export function addSourceWidget(source, addWidget) {
  addWidget(`source-${source}`, "Source", {
    source,
    title: source ? c.titleize(source) : "All Activity",
  });
}

export function addEntityWidget(entity, addWidget) {
  addWidget(`entity-${entity.globalActor}`, "Entity", {
    entity,
    title: entity.id,
  });
}

export function addChannelWidget(source, sourceChannel, addWidget) {
  addWidget(`channel-${source}-${sourceChannel}`, "Channel", {
    source,
    sourceChannel,
    title: c.displayChannel(sourceChannel),
  });
}

export function addChannelsWidget(source, addWidget) {
  addWidget(`channels-${source}`, "Channels", {
    source,
    title: `${c.titleize(source)} channels`,
  });
}

export function addActivityWidget(activity, addWidget) {
  addWidget(`activity-${activity.id}`, "Conversation", {
    activity,
    title: "...",
  });
}

export const clickHandlers = (addWidget) => ({
  onClickMember: (e, member) => {
    e.stopPropagation();
    addMemberWidget(member, addWidget);
  },
  onClickSource: (e, source) => {
    e.stopPropagation();
    addSourceWidget(source, addWidget);
  },
  onClickChannel: (e, source, sourceChannel) => {
    e.stopPropagation();
    addChannelWidget(source, sourceChannel, addWidget);
  },
  onClickEntity: (e, entity) => {
    e.stopPropagation();
    addEntityWidget(entity, addWidget);
  },
  onClickChannels: (e, source) => {
    e.stopPropagation();
    addChannelsWidget(source, addWidget);
  },
  onClickConnection: (e, member, connection) => {
    e.stopPropagation();
    addConnectionWidget(member, connection);
  },
  onClickActivity: (e, activity) => {
    e.stopPropagation();
    addActivityWidget(activity, addWidget);
  },
  onClickEntity: (e, entity) => {
    e.stopPropagation();
    addEntityWidget(entity, addWidget);
  },
});
