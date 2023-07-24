import React, { useContext } from "react";

// available widgets
import Channel from "../Channel";
import Channels from "../Channels";
import Connection from "../Connection";
import Conversation from "../Conversation";
import Home from "../Home";
import Member from "../Member";
import Members from "../Members";
import EditProject from "../EditProject";
import Assistant from "../Assistant";
import Search from "../Search";
import Source from "../Source";

import { WidgetContext } from "src/components/context/WidgetContext";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import { addWidget } from "src/components/widgets/setup/widgets";

const components = {
  Channel: (props) => WithContext(Channel, props),
  Channels: (props) => WithContext(Channels, props),
  Conversation: (props) => WithContext(Conversation, props),
  Connection: (props) => WithContext(Connection, props),
  Home: (props) => WithContext(Home, props),
  Member: (props) => WithContext(Member, props),
  Members: (props) => WithContext(Members, props),
  EditProject: (props) => WithContext(EditProject, props),
  Assistant: (props) => WithContext(Assistant, props),
  Search: (props) => WithContext(Search, props),
  Source: (props) => WithContext(Source, props),
};
export default components;

const WithContext = (Component, props) => {
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
