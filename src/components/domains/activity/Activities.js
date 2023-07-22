import React, { useState, useRef, useEffect } from "react";
import classnames from "classnames";

import Preview from "src/components/domains/conversation/Preview";

const pageSize = 10;

export default function Activities(props) {
  const { activities, community, handlers, maxDepth } = props;
  const { onClickActivity } = handlers;
  const containerRef = useRef();

  const firstPageOfItems = activities.slice(0, pageSize);
  const totalPages = Math.floor(activities.length / pageSize);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(firstPageOfItems);
  const [lastElement, setLastElement] = useState(null);

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        if (page <= totalPages) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    })
  );

  useEffect(() => {
    setItems(activities.slice(0, pageSize * (page + 1)));
  }, [activities, page]);

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  return (
    <div ref={containerRef}>
      {items
        .filter((a) => a)
        .map((activity, index) => (
          <div
            key={activity.id}
            ref={
              index === items.length - 1 && page <= totalPages
                ? setLastElement
                : null
            }
            onClick={(e) => onClickActivity(e, activity)}
            className={classnames(
              "flex flex-col py-3 px-6 cursor-pointer border-y border-gray-200 dark:border-gray-800",
              {
                "hover:bg-gray-100 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40":
                  index % 2 === 0,
                "bg-gray-100 hover:bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 dark:hover:bg-opacity-90":
                  index % 2 === 1,
              }
            )}
          >
            <Preview
              key={activity.id}
              activity={activity}
              community={community}
              maxDepth={maxDepth}
              handlers={handlers}
            />
          </div>
        ))}
      {page - 1 === totalPages && <p className="my-5 text-center">♥</p>}
    </div>
  );
}
