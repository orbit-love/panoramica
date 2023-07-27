import React, { useState, useLayoutEffect, useRef } from "react";
import classNames from "classnames";

export default function ScrollManager({ isActive, fullWidth, children }) {
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
      className={classNames(
        "overflow-y-auto overflow-x-hidden relative h-full",
        {
          "max-w-xl": !fullWidth,
        }
      )}
    >
      {children}
    </div>
  );
}
