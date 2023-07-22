import React, { useState, useLayoutEffect, useRef } from "react";

export default function ScrollManager({ isActive, children }) {
  const scrollRef = useRef();
  const [scrollValue, setScrollValue] = useState(0);

  useLayoutEffect(() => {
    if (isActive) {
      scrollRef.current.scrollTop = scrollValue;
    }
  }, [isActive, scrollValue]);

  const onScroll = (e) => {
    setScrollValue(e.target.scrollTop);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="overflow-y-auto relative h-full"
    >
      {children}
    </div>
  );
}
