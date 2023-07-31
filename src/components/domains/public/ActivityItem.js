import React, { useState } from "react";
import classnames from "classnames";
import PreviewView from "src/components/domains/conversation/views/PreviewView";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";

export default function ActivityItem(props) {
  const { activity, community, index, className } = props;
  const [expanded, setExpanded] = useState(false);

  const conversationActivity = community.findActivityById(
    activity.conversationId
  );
  const conversation = community.conversations[conversationActivity.id];
  const canExpand = conversation?.children?.length > 0;

  const onExpand = () => {
    let selection = window.getSelection().toString();
    if (canExpand && selection.length <= 0) {
      setExpanded(!expanded);
    }
  };

  var defaultClassName = classnames(
    "group/menu flex flex-col py-6 px-6 relative border-b border-b-gray-300 dark:border-b-gray-700",
    {
      "hover:bg-gray-100 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40":
        index % 2 === 0,
      "bg-gray-100 hover:bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 dark:hover:bg-opacity-90":
        index % 2 === 1,
    }
  );

  return (
    <div className={className || defaultClassName}>
      {expanded && (
        <FullThreadView {...props} activity={conversationActivity} />
      )}
      {!expanded && <PreviewView onExpand={onExpand} {...props} />}
    </div>
  );
}
