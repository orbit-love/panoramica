import React from "react";

export default function Scroll({ children }) {
  return <div className="h-[100%] overflow-y-scroll">{children}</div>;
}
