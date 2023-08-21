import React, { useState, useContext, useEffect } from "react";
import classnames from "classnames";

import { BookmarksContext } from "src/components/context/BookmarksContext";
import PreviewView from "src/components/domains/conversation/views/PreviewView";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import Toolbar from "src/components/domains/conversation/Toolbar";
import { postCreateActivityProperties } from "src/data/client/fetches";

export default function ConversationFeedItem(props) {
  var {
    index,
    project,
    activity: initialActivity,
    handlers,
    minimal,
    term,
  } = props;

  const [activity, setActivity] = useState(initialActivity);

  const bookmarksContext = useContext(BookmarksContext);
  const bookmarks = bookmarksContext.bookmarks;

  const conversation = activity.conversation;
  const bookmark = bookmarks.find(
    (bookmark) => bookmark.node.id === conversation.id
  );

  const defaultExpanded = conversation.descendants.length === 1;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const canExpand = conversation.descendants.length > 1;

  const onOpen = (e) => {
    handlers.onClickActivity(e, conversation);
  };
  const onExpand = () => {
    let selection = window.getSelection().toString();
    if (canExpand && selection.length <= 0) {
      setExpanded(!expanded);
    }
  };

  useEffect(() => {
    // if the activity has no properties or only 1 property
    // fire off a request to generate properties
    if (activity.properties?.length <= 1) {
      postCreateActivityProperties({
        project,
        activity,
        onSuccess: ({ data }) => {
          const newProperties = data.properties;
          setActivity({
            ...activity,
            properties: newProperties,
          });
          console.log(newProperties);
        },
      });
    }
  }, [project, activity]);

  return (
    <div
      className={classnames(
        "group/menu flex flex-col relative border-b border-b-gray-300 dark:border-b-gray-700",
        {
          "hover:bg-gray-100 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40":
            index % 2 === 1,
          "bg-gray-100 hover:bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 dark:hover:bg-opacity-90":
            index % 2 === 0,
          "border-l-2 border-tertiary": !!bookmark,
        }
      )}
    >
      {activity.properties?.length > 1 && (
        <div className="flex flex-wrap pt-4 px-6">
          {activity.properties.map((property, index) => {
            return (
              <div key={index} className="m-1">
                <div className="text-gray-500">
                  {property.name}:{" "}
                  <span className="font-semibold">{property.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {expanded && (
        <FullThreadView
          {...props}
          activity={activity}
          conversation={conversation}
          term={term}
        />
      )}
      {!expanded && <PreviewView onExpand={onExpand} {...props} />}
      <Toolbar
        {...props}
        activity={conversation}
        canExpand={canExpand}
        expanded={expanded}
        setExpanded={setExpanded}
        onOpen={onOpen}
        onExpand={onExpand}
        minimal={minimal}
        bookmark={bookmark}
      />
    </div>
  );
}
