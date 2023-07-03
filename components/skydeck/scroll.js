import React from "react";

export default function Scroll({ children }) {
  return (
    <div className="min-w-[350px] h-[100%] overflow-x-hidden overflow-y-scroll break-words">
      {children}
    </div>
  );
}
