import React, { useState } from "react";
import classnames from "classnames";

import PreviewView from "src/components/domains/conversation/views/PreviewView";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import Toolbar from "src/components/domains/conversation/Toolbar";

export default function ConversationFeedItem(props) {
  var { index, activity, community, handlers } = props;
  var [expanded, setExpanded] = useState(false);

  var conversationActivity = community.findActivityById(
    activity.conversationId
  );
  var conversation = community.conversations[conversationActivity.id];
  var canExpand = conversation?.children?.length > 0;

  var onOpen = (e) => {
    handlers.onClickActivity(e, conversationActivity);
  };

  var onExpand = () => {
    let selection = window.getSelection().toString();
    if (canExpand && selection.length <= 0) {
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
      {expanded && (
        <FullThreadView {...props} activity={conversationActivity} />
      )}
      {!expanded && <PreviewView {...props} />}
      <Toolbar
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
