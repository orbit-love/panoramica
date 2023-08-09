import React, { useState, useRef, useEffect } from "react";

class FakeObserver {
  observe() {}
  unobserve() {}
}

export default function Paginated({
  activities,
  eachActivity,
  first,
  after,
  setFirst,
  setAfter,
  hasNextPage,
}) {
  const containerRef = useRef();

  // const firstPageOfItems = activities.slice(0, pageSize);
  // const totalPages = Math.floor(activities.length / pageSize);
  // const [page, setPage] = useState(1);
  // const [items, setItems] = useState(firstPageOfItems);
  const [lastElement, setLastElement] = useState(null);

  var Observer;
  if (typeof window === "undefined") {
    Observer = FakeObserver;
  } else {
    Observer = IntersectionObserver;
  }

  const observer = useRef(
    new Observer((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        if (hasNextPage) {
          setAfter((after) => after + 1);
        }
      }
    })
  );

  // useEffect(() => {
  //   setItems(activities.slice(0, pageSize * (page + 1)));
  // }, [activities, page]);

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
      {activities.map((activity, index) => (
        <div key={activity.id} ref={!hasNextPage ? setLastElement : null}>
          {eachActivity({ activity, index })}
        </div>
      ))}
      {!hasNextPage && <p className="my-5 text-center">♥</p>}
    </div>
  );
}
