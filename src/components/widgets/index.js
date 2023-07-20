import React, { useContext, useCallback } from "react";

// export commonly used components for convenience
export { default as Frame } from "./base/Frame";
export { default as Header } from "./base/Header";
export { default as Channel } from "./Channel";
export { default as Channels } from "./Channels";
export { default as Connection } from "./Connection";
export { default as Conversation } from "./Conversation";
export { default as Home } from "./Home";
export { default as Member } from "./Member";
export { default as Members } from "./Members";
export { default as Project } from "./Project";
export { default as Prompt } from "./Prompt";
export { default as Search } from "./Search";
export { default as Source } from "./Source";
export { default as ActivityFeed } from "src/components/domains/activity/ActivityFeed";

export * from "src/data/client/fetches";

// available widgets
import Channel from "./Channel";
import Channels from "./Channels";
import Connection from "./Connection";
import Conversation from "./Conversation";
import Home from "./Home";
import Member from "./Member";
import Members from "./Members";
import Project from "./Project";
import Prompt from "./Prompt";
import Search from "./Search";
import Source from "./Source";

// context for wrapping widgets
import { WidgetContext } from "src/components/context/WidgetContext";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import c from "src/configuration/common";

export const storageKey = (project) => `dockview-${project.id}`;
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
  homePanel.group.api.setConstraints({ minimumWidth: 175, maximumWidth: 250 });
  homePanel.group.locked = true;
};

export const saveLayout = ({ project, containerApi }) => {
  const layout = containerApi.toJSON();
  localStorage.setItem(storageKey(project), JSON.stringify(layout));
  console.log("Layout saved...");
};

var Wrap = (Component, props) => {
  // pass the project context down
  const projectContext = useContext(ProjectContext);
  const projectDispatch = useContext(ProjectDispatchContext);
  // pass down a widget context with the dockview api object for the panel
  // the Component will receive dockview props directly, the context is to
  // allow child components like Frame to access the properties easily
  const widgetContext = { api: props.api };
  var addWidgetFunc = addWidget(props);
  return (
    <WidgetContext.Provider value={widgetContext}>
      <Component
        {...props}
        addWidget={addWidgetFunc}
        {...projectContext}
        dispatch={projectDispatch}
        handlers={clickHandlers(addWidgetFunc)}
      />
    </WidgetContext.Provider>
  );
};

export const components = {
  Channel: (props) => Wrap(Channel, props),
  Channels: (props) => Wrap(Channels, props),
  Conversation: (props) => Wrap(Conversation, props),
  Connection: (props) => Wrap(Connection, props),
  Home: (props) => Wrap(Home, props),
  Member: (props) => Wrap(Member, props),
  Members: (props) => Wrap(Members, props),
  Project: (props) => Wrap(Project, props),
  Prompt: (props) => Wrap(Prompt, props),
  Search: (props) => Wrap(Search, props),
  Source: (props) => Wrap(Source, props),
};

import SourceIcon from "src/components/domains/activity/SourceIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TabComponentWithIcon = ({ api, icon, children }) => {
  var { title } = api;
  const onClose = useCallback(
    (event) => {
      event.stopPropagation();
      api.close();
    },
    [api]
  );

  const onClick = (event) => {
    if (event.detail == 2) {
      let fullscreen = api.panel.params.fullscreen;
      api.updateParameters({ fullscreen: !fullscreen });
    }
  };

  return (
    <div className="dockview-react-tab" onClick={onClick} title={title}>
      <div className="dockview-react-tab-title max-w-[200px] overflow-x-hidden text-ellipsis whitespace-nowrap">
        {children}
        {!children && (
          <>
            {icon}
            <span className="pl-1 pr-4">{title}</span>
          </>
        )}
      </div>
      <div className="" onClick={onClose}>
        <FontAwesomeIcon icon="xmark" />
      </div>
    </div>
  );
};
export const tabComponents = {
  Home: ({ api }) => {
    return <TabComponentWithIcon api={api} />;
  },
  Source: ({ api, params: { source } }) => {
    var icon = source ? (
      <SourceIcon activity={{ source }} />
    ) : (
      <FontAwesomeIcon icon="list" />
    );
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Conversation: ({ api }) => {
    var icon = <FontAwesomeIcon icon={["regular", "message"]} />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Prompt: ({ api }) => {
    var icon = <FontAwesomeIcon icon="circle-nodes" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Search: ({ api }) => {
    var icon = <FontAwesomeIcon icon="search" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Member: ({ api }) => {
    var icon = <FontAwesomeIcon icon="user-astronaut" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Members: ({ api }) => {
    var icon = <FontAwesomeIcon icon="list" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Connection: ({ api, title, params: { member, connection } }) => {
    return (
      <TabComponentWithIcon api={api}>
        <div title={title} className="flex items-center space-x-1">
          <span>{member.globalActorName.split(" ")[0]}</span>
          <FontAwesomeIcon icon="right-left" className="text-[10px]" />
          <span>{connection.globalActorName.split(" ")[0]}</span>
        </div>
      </TabComponentWithIcon>
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

export function addConnectionWidget(
  member,
  connection,
  addWidget,
  options = {}
) {
  var title = `${member.globalActorName} - ${connection.globalActorName}`;
  addWidget(
    `connection-${member.globalActor}-${connection.globalActor}`,
    "Connection",
    {
      member,
      connection,
      title,
      ...options,
    }
  );
}

export function addSourceWidget(source, addWidget, options = {}) {
  addWidget(`source-${source}`, "Source", {
    source,
    title: source ? c.titleize(source) : "All Activity",
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
    title: activity.summary || "...",
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
  onClickChannels: (e, source, options) => {
    e.stopPropagation();
    addChannelsWidget(source, addWidget, options);
  },
  onClickConnection: (e, member, connection, options) => {
    e.stopPropagation();
    addConnectionWidget(member, connection, addWidget, options);
  },
  onClickActivity: (e, activity, options) => {
    e.stopPropagation();
    addActivityWidget(activity, addWidget, options);
  },
});
