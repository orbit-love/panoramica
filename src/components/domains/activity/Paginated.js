import React, { useState, useRef, useEffect } from "react";

const pageSize = 10;

export default function Paginated(props) {
  const { activities, eachActivity } = props;
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
      {items.map((activity, index) => (
        <div
          key={activity.id}
          ref={
            index === items.length - 1 && page <= totalPages
              ? setLastElement
              : null
          }
        >
          {eachActivity({ activity, index })}
        </div>
      ))}
      {page - 1 === totalPages && <p className="my-5 text-center">♥</p>}
    </div>
  );
}
