import React from "react";
import classnames from "classnames";
import TimeAgo from "react-timeago";

import utils from "src/utils";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ManageConversationProperty from "./ManageConversationProperty";
import Loader from "src/components/domains/ui/Loader";

export default function ConversationItem({
  project,
  conversation,
  setConversations,
  controlledProperties = [],
  selectedRows,
  setSelectedRows,
  loadingRows,
  setLoadingRows,
  propertyFilters,
  setRefetchNow,
}) {
  const [preview, setPreview] = React.useState(false);

  const isLoading = loadingRows.includes(conversation.id);
  const [loading, setLoading] = React.useState(isLoading);

  React.useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const isLoadingRef = React.useRef(isLoading);
  React.useEffect(() => {
    if (loading && !isLoadingRef.current) {
      setLoadingRows((loadingRows) => [...loadingRows, conversation.id]);
    }
    if (!loading) {
      setLoadingRows((loadingRows) =>
        loadingRows.filter((id) => id !== conversation.id)
      );
    }
  }, [loading, setLoadingRows, conversation.id]);

  const isSelected = selectedRows.includes(conversation.id);

  const toggleSelection = React.useCallback(() => {
    const { id } = conversation;
    if (!isSelected) {
      setSelectedRows((selectedRows) => [...selectedRows, id]);
    } else {
      setSelectedRows((selectedRows) =>
        selectedRows.filter((rowId) => rowId !== id)
      );
    }
  }, [conversation, setSelectedRows, isSelected]);

  const titleProperty = utils.getProperty("title", conversation);
  const handlers = {};

  const activity = conversation.descendants[0];

  return (
    <tr
      className={classnames("border-y border-gray-100 dark:border-gray-800", {
        "dark:bg-opacity-30 hover:bg-opacity-50 bg-blue-100 dark:bg-blue-900":
          isSelected,
        "dark:hover:bg-gray-800 hover:bg-gray-50": !isSelected,
      })}
    >
      <td className="py-2 pl-4">
        <div className="flex justify-center">
          {loading && <Loader />}
          {!loading && (
            <input
              type="checkbox"
              onChange={toggleSelection}
              checked={isSelected}
            />
          )}
        </div>
      </td>
      <td className="relative py-2 px-4">
        <div
          className="flex flex-col space-y-1 w-[325px] overflow-hidden"
          onClick={toggleSelection}
        >
          <div className="font-semibold">
            {titleProperty?.value || activity.text.slice(0, 30) + "..."}
          </div>
          <div className="flex space-x-3 whitespace-nowrap">
            <div className="text-primary max-w-[100px] overflow-hidden text-ellipsis">
              {activity.member.globalActorName}
            </div>
            <div
              className="underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setPreview((preview) => !preview);
              }}
            >
              {conversation.descendants.length - 1} replies
            </div>
            <TimeAgo
              date={activity.timestamp}
              title={utils.formatDate(activity.timestamp)}
            />
          </div>
          {preview && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setPreview(false);
              }}
              className="absolute w-[600px] max-h-[500px] overflow-y-scroll left-0 top-14 bg-gray-100 dark:bg-gray-900 shadow-lg z-[1000] border dark:border-gray-800 border-gray-200"
            >
              <FullThreadView conversation={conversation} handlers={handlers} />
            </div>
          )}
        </div>
      </td>
      <td className="py-2 px-4">
        <div>
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <SourceIcon activity={activity} />
            {activity.sourceChannel && (
              <span>{activity.sourceChannel?.split("/")?.slice(-1)}</span>
            )}
          </div>
        </div>
      </td>
      {controlledProperties.map(({ name, values }) => (
        <td className="py-2 px-4" key={name}>
          <ManageConversationProperty
            project={project}
            conversation={conversation}
            setConversations={setConversations}
            propertyName={name}
            propertyValues={values}
            setLoading={setLoading}
            onSave={() => setRefetchNow((refetchNow) => refetchNow + 1)}
          />
        </td>
      ))}
      {propertyFilters
        .filter(({ name }) => controlledProperties.find((p) => p.name !== name))
        .map(({ name }) => {
          const properties = utils.getProperties(name, conversation);
          return (
            <td className="py-2 px-4" key={name}>
              <div className="flex flex-wrap w-[200px]">
                {properties.map((property, index) => (
                  <div
                    key={index}
                    title={property.value}
                    className="overflow-hidden py-1 px-2 mr-1 mb-1 whitespace-nowrap bg-gray-100 rounded dark:bg-gray-800"
                  >
                    <div className="overflow-hidden text-xs text-ellipsis">
                      {property.value}
                    </div>
                  </div>
                ))}
              </div>
            </td>
          );
        })}
    </tr>
  );
}
