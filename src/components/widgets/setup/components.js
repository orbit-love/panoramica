import React, { useContext } from "react";

// available widgets
import Bookmarks from "../Bookmarks";
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
import User from "../User";
import Similar from "../Similar";

import { WidgetContext } from "src/components/context/WidgetContext";

import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import { addWidget, clickHandlers } from "src/components/widgets/setup/widgets";

const components = {
  Bookmarks: (props) => WithContext(Bookmarks, props),
  Channel: (props) => WithContext(Channel, props),
  Channels: (props) => WithContext(Channels, props),
  Conversation: (props) => WithContext(Conversation, props),
  Connection: (props) => WithContext(Connection, props),
  Home: (props) => WithContext(Home, props),
  Member: (props) => WithContext(Member, props),
  Members: (props) => WithContext(Members, props),
  EditProject: (props) => WithContext(EditProject, props),
  User: (props) => WithContext(User, props),
  Assistant: (props) => WithContext(Assistant, props),
  Search: (props) => WithContext(Search, props),
  Source: (props) => WithContext(Source, props),
  Similar: (props) => WithContext(Similar, props),
};
export default components;

const WithContext = (Component, props) => {
  // pass the project context down
  const projectContext = useContext(ProjectContext);
  const projectDispatch = useContext(ProjectDispatchContext);
  // pass down a widget context with the dockview api object for the panel
  // the Component will receive dockview props directly, the context is to
  // allow child components like Frame to access the properties easily
  var addWidgetFunc = addWidget(props);
  const widgetContext = { api: props.api, addWidget: addWidgetFunc };
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
