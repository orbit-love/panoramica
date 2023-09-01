import React, { useCallback } from "react";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const tabComponents = {
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
    var icon = <FontAwesomeIcon icon="comment" flip="horizontal" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Assistant: ({ api }) => {
    var icon = <FontAwesomeIcon icon="wand-magic-sparkles" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Search: ({ api }) => {
    var icon = <FontAwesomeIcon icon="search" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  Similar: ({ api }) => {
    var icon = <FontAwesomeIcon icon="wand-magic-sparkles" />;
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
  Bookmarks: ({ api }) => {
    var icon = <FontAwesomeIcon icon="bookmark" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  EditProject: ({ api }) => {
    var icon = <FontAwesomeIcon icon="gear" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  EditPrompts: ({ api }) => {
    var icon = <FontAwesomeIcon icon="gear" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  IndexDocumentation: ({ api }) => {
    var icon = <FontAwesomeIcon icon="gear" />;
    return <TabComponentWithIcon api={api} icon={icon} />;
  },
  User: ({ api }) => {
    var icon = <FontAwesomeIcon icon="user" />;
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
export default tabComponents;

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
    <div
      className="dockview-react-tab hover:dark:bg-gray-950 hover:bg-gray-100"
      onClick={onClick}
      title={title}
    >
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
