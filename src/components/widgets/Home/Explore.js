import React, { useContext } from "react";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import { BookmarksContext } from "src/components/context/BookmarksContext";

export default function Explore({ newPanelPosition, addWidget, handlers }) {
  const { onClickSource, onClickActivity } = handlers;

  const onClickAssistant = () => {
    addWidget("prompt", "Assistant", {
      title: "Assistant",
      position: newPanelPosition(),
    });
  };

  const onClickBookmarks = (e) => {
    e.preventDefault();
    addWidget("bookmarks", "Bookmarks", {
      title: "Bookmarks",
      position: newPanelPosition(),
    });
  };

  // const { bookmarks } = useContext(BookmarksContext);
  // todo graphql load
  const bookmarks = [];

  return (
    <div className="flex flex-col items-start w-full">
      <div className="text-tertiary pb-1 font-semibold">Explore</div>
      <button
        onClick={(e) =>
          onClickSource(e, null, { position: newPanelPosition() })
        }
      >
        All Activity
      </button>
      <button
        onClick={() =>
          addWidget("members", "Members", {
            title: "Members",
            position: newPanelPosition(),
          })
        }
      >
        Member List
      </button>
      <button onClick={onClickAssistant}>Assistant</button>
      <button onClick={onClickBookmarks}>Bookmarks ({bookmarks.length})</button>
      <div className="flex flex-col items-start w-full whitespace-nowrap">
        {bookmarks
          .map(({ activityId }) => community.findActivityById(activityId))
          .map((activity) => (
            <div
              key={activity.id}
              className="group flex items-center space-x-1 w-full text-sm text-left text-gray-400 text-ellipsis cursor-pointer dark:text-gray-500"
              onClick={(e) =>
                onClickActivity(e, activity, {
                  position: newPanelPosition(),
                })
              }
            >
              <SourceIcon activity={activity} className="text-xs" />
              <div className="group-hover:underline overflow-x-hidden w-full text-ellipsis">
                {activity.summary || activity.text.slice(0, 50)}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
