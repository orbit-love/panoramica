import React from "react";

export default function EmptyLayout({ children }) {
  const proseClasses = ["prose prose-sm"];
  return <div className={proseClasses.join(" ")}>{children}</div>;
}
