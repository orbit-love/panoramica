import React from "react";

export default function Scroll({ children }) {
  return (
    <div className="h-[100%] overflow-x-hidden overflow-y-scroll break-words">
      {children}
    </div>
  );
}
