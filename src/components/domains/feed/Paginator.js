import React, { useState, useRef, useEffect } from "react";

class FakeObserver {
  observe() {}
  unobserve() {}
}

export default function Paginator({
  activities,
  eachActivity,
  setFirst,
  pageInfo,
}) {
  const { hasNextPage } = pageInfo;
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
          setFirst((first) => first + 10);
        }
      }
    })
  );

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
    <>
      {activities.map((activity, index) => (
        <div key={activity.id} ref={hasNextPage ? setLastElement : null}>
          {eachActivity({ activity, index })}
        </div>
      ))}
      {!hasNextPage && <p className="my-5 text-center">♥</p>}
    </>
  );
}
