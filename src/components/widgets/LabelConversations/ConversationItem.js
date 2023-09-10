import React from "react";
import classnames from "classnames";
import TimeAgo from "react-timeago";

import utils from "src/utils";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ManageActivityProperty from "./ManageActivityProperty";
import Loader from "src/components/domains/ui/Loader";

export default function ConversationItem({
  project,
  activity,
  setActivities,
  controlledProperties = [],
  selectedRows,
  setSelectedRows,
  loadingRows,
  setLoadingRows,
  propertyFilters,
}) {
  const [preview, setPreview] = React.useState(false);

  const isLoading = loadingRows.includes(activity.id);
  const [loading, setLoading] = React.useState(isLoading);

  React.useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const isLoadingRef = React.useRef(isLoading);
  React.useEffect(() => {
    if (loading && !isLoadingRef.current) {
      setLoadingRows((loadingRows) => [...loadingRows, activity.id]);
    }
    if (!loading) {
      setLoadingRows((loadingRows) =>
        loadingRows.filter((id) => id !== activity.id)
      );
    }
  }, [loading, setLoadingRows, activity.id]);

  const isSelected = selectedRows.includes(activity.id);

  const toggleSelection = React.useCallback(() => {
    const { id } = activity;
    if (!isSelected) {
      setSelectedRows((selectedRows) => [...selectedRows, id]);
    } else {
      setSelectedRows((selectedRows) =>
        selectedRows.filter((rowId) => rowId !== id)
      );
    }
  }, [activity, setSelectedRows, isSelected]);

  const titleProperty = utils.getProperty("title", activity);
  const handlers = {};

  return (
    <tr
      className={classnames("border-y border-gray-100 dark:border-gray-800", {
        "dark:bg-opacity-30 hover:bg-opacity-50 dark:bg-fuchsia-900":
          isSelected,
        "dark:bg-opacity-10 hover:bg-gray-50 dark:bg-fuchsia-900": !isSelected,
      })}
    >
      <td className="p-2 align-middle">
        <div className="flex justify-center w-6">
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
      <td className="relative p-2">
        <div className="w-[350px] overflow-hidden" onClick={toggleSelection}>
          <>
            <div className="font-semibold">
              {titleProperty?.value || activity.text.slice(0, 30) + "..."}
            </div>
            <div className="flex space-x-3 whitespace-nowrap">
              <div className="text-primary max-w-[100px] overflow-hidden text-ellipsis">
                {activity.member.globalActorName}
              </div>
              <div>
                <SourceIcon activity={activity} />
              </div>
              <div
                className="underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview((preview) => !preview);
                }}
              >
                {activity.descendants.length - 1} replies
              </div>
              <TimeAgo
                date={activity.timestamp}
                title={utils.formatDate(activity.timestamp)}
              />
            </div>
          </>
          {preview && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setPreview(false);
              }}
              className="absolute w-[600px] max-h-[500px] overflow-y-scroll left-0 top-14 bg-gray-100 dark:bg-gray-900 shadow-lg z-[1000] border dark:border-gray-800 border-gray-200"
            >
              <FullThreadView
                activity={activity}
                conversation={activity}
                handlers={handlers}
              />
            </div>
          )}
        </div>
      </td>
      {controlledProperties.map(({ name, values }) => (
        <td className="p-2" key={name}>
          <ManageActivityProperty
            project={project}
            activity={activity}
            setActivities={setActivities}
            propertyName={name}
            propertyValues={values}
            setLoading={setLoading}
          />
        </td>
      ))}
      {propertyFilters
        .filter(({ name }) => controlledProperties.find((p) => p.name !== name))
        .map(({ name }) => {
          const properties = utils.getProperties(name, activity);
          return (
            <td className="p-2" key={name}>
              <div className="flex flex-wrap max-w-[200px]">
                {properties.map((property, index) => (
                  <div
                    key={index}
                    title={property.value}
                    className="overflow-hidden py-1 px-2 mr-1 mb-1 whitespace-nowrap bg-gray-100 rounded"
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
