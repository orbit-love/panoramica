import React, { useState } from "react";
import classnames from "classnames";

import Preview from "src/components/domains/conversation/Preview";
import Expanded from "src/components/domains/conversation/Expanded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Menu = ({ onOpen, onExpand, canExpand, expanded }) => {
  return (
    <div className="group-hover/menu:flex text-tertiary bg-opacity-80 hidden absolute bottom-4 right-6 py-1 px-3 space-x-4 bg-gray-200 rounded-full dark:bg-gray-700">
      {canExpand && (
        <>
          {expanded && (
            <button onClick={onExpand}>
              <FontAwesomeIcon icon="chevron-up" />
            </button>
          )}
          {!expanded && (
            <button onClick={onExpand}>
              <FontAwesomeIcon icon="chevron-down" />
            </button>
          )}
        </>
      )}
      {
        <button onClick={onOpen}>
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      }
    </div>
  );
};

export default function Expandable(props) {
  var { index, activity, community, handlers } = props;
  var [expanded, setExpanded] = useState(false);

  var conversation = community.findActivityById(activity.conversationId);
  var thread = community.threads[conversation.id];
  var canExpand = thread?.children?.length > 0;

  var onOpen = (e) => {
    handlers.onClickActivity(e, conversation);
  };

  var onExpand = () => {
    let selection = window.getSelection().toString();
    if (selection.length <= 0) {
      setExpanded(!expanded);
    }
  };

  return (
    <div
      onClick={onExpand}
      className={classnames(
        "group/menu flex flex-col py-6 px-6 relative border-y border-gray-200 dark:border-gray-800",
        {
          "hover:bg-gray-100 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40":
            index % 2 === 0,
          "bg-gray-100 hover:bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 dark:hover:bg-opacity-90":
            index % 2 === 1,
        }
      )}
    >
      {expanded && <Expanded {...props} activity={conversation} />}
      {!expanded && <Preview {...props} />}
      <Menu
        {...props}
        canExpand={canExpand}
        expanded={expanded}
        setExpanded={setExpanded}
        onOpen={onOpen}
        onExpand={onExpand}
      />
    </div>
  );
}
