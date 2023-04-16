import React from "react";

export default function EmptyLayout({ children }) {
  const proseClasses = ["prose prose-sm prose-p:leading-tight"];
  return <div className={proseClasses.join(" ")}>{children}</div>;
}
