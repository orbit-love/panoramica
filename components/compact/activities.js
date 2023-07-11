import React, { useState, useRef, useEffect, useCallback } from "react";
import classnames from "classnames";

import Thread from "components/compact/thread";

const pageSize = 20;

export default function Activities(props) {
  const { activities, community, handlers, hideNoActivities, maxDepth } = props;
  const { onClickActivity } = handlers;
  const containerRef = useRef();
  const loaderRef = useRef();

  const firstPageOfItems = activities.slice(0, pageSize);
  const totalPages = Math.floor(activities.length / pageSize);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(firstPageOfItems);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        if (page < totalPages) {
          var nextPage = page + 1;
          setItems(activities.slice(0, pageSize * nextPage));
          setPage(nextPage);
        }
      }
    },
    [page, totalPages, activities]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "40px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
  }, [handleObserver]);

  return (
    <div ref={containerRef} className="overflow-y-scroll h-[95%]">
      {items.map((activity, index) => (
        <div
          key={activity.id}
          onClick={(e) => onClickActivity(e, activity)}
          className={classnames("flex flex-col py-3 px-4 cursor-pointer", {
            "bg-indigo-800 bg-opacity-20 hover:bg-blue-900 hover:bg-opacity-30":
              index % 2 === 0,
            "bg-blue-900 bg-opacity-20 hover:bg-opacity-30": index % 2 === 1,
          })}
        >
          <Thread
            key={activity.id}
            activity={activity}
            community={community}
            maxDepth={maxDepth}
            handlers={handlers}
          />
        </div>
      ))}
      <div ref={loaderRef} />
      {!hideNoActivities && activities.length === 0 && (
        <div className="p-4 text-indigo-700 w-[450px]">No activities.</div>
      )}
    </div>
  );
}
