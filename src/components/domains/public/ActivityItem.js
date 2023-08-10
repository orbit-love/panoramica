import React, { useState } from "react";
import classnames from "classnames";
import PreviewView from "src/components/domains/conversation/views/PreviewView";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";

export default function ActivityItem({ activity, className, term, handlers }) {
  const conversation = activity.conversation;
  const canExpand = conversation.descendants.length > 1;

  const defaultExpanded = conversation.descendants.length === 1;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const onExpand = () => {
    let selection = window.getSelection().toString();
    if (canExpand && selection.length <= 0) {
      setExpanded(!expanded);
    }
  };

  var defaultClassName = classnames(
    "group/menu bg-gray-50 hover:bg-gray-100 hover:bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-50 flex flex-col p-6 my-6 relative rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 hover:dark:bg-opacity-70"
  );
  const viewProps = {
    activity,
    conversation,
    term,
    handlers,
  };

  return (
    <div className={className || defaultClassName}>
      {expanded && <FullThreadView {...viewProps} />}
      {!expanded && <PreviewView onExpand={onExpand} {...viewProps} />}
    </div>
  );
}
