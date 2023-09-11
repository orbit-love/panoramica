import React, { useContext } from "react";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import { BookmarksContext } from "src/components/context/BookmarksContext";

export default function Explore({ newPanelPosition, addWidget, handlers }) {
  const { onClickSource, onClickConversation } = handlers;

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

  const { bookmarks } = useContext(BookmarksContext);

  return (
    <div className="flex flex-col items-start w-full">
      <div className="text-tertiary pb-1 font-semibold">Explore</div>
      <div
        className="cursor-pointer hover:underline"
        onClick={(e) =>
          onClickSource(e, null, { position: newPanelPosition() })
        }
      >
        All Activity
      </div>
      <div
        className="cursor-pointer hover:underline"
        onClick={() =>
          addWidget("members", "Members", {
            title: "Members",
            position: newPanelPosition(),
          })
        }
      >
        Member List
      </div>
      <div
        className="cursor-pointer hover:underline"
        onClick={onClickAssistant}
      >
        Assistant
      </div>
      <div
        className="cursor-pointer hover:underline"
        onClick={onClickBookmarks}
      >
        Bookmarks ({bookmarks.length})
      </div>
      <div className="flex flex-col items-start w-full whitespace-nowrap">
        {bookmarks.map(({ node: conversation }) => (
          <div
            key={conversation.id}
            className="group flex items-center space-x-1 w-full text-sm text-left text-gray-400 text-ellipsis cursor-pointer dark:text-gray-500"
            onClick={(e) =>
              onClickConversation(e, conversation, {
                position: newPanelPosition(),
              })
            }
          >
            <SourceIcon
              activity={conversation.descendants[0]}
              className="text-xs"
            />
            <div className="group-hover:underline overflow-x-hidden w-full text-ellipsis">
              {conversation.properties.find(
                (property) => property.name === "title"
              )?.value || conversation.descendants[0].text.slice(0, 50)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
