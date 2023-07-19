import React, { useState, useRef, useEffect } from "react";
import classnames from "classnames";

import Thread from "src/components/domains/activity/Thread";

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
    <div ref={containerRef} className="overflow-y-scroll">
      {items.map((activity, index) => (
        <div
          key={activity.id}
          ref={
            index === items.length - 1 && page <= totalPages
              ? setLastElement
              : null
          }
          onClick={(e) => onClickActivity(e, activity)}
          className={classnames(
            "flex flex-col py-3 px-4 cursor-pointer border-b theme-border-color",
            {
              "": index % 2 === 0,
              "": index % 2 === 1,
            }
          )}
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
      {page - 1 === totalPages && <p className="my-5 text-center">♥</p>}
    </div>
  );
}
