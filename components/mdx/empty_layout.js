import React from "react";

export default function EmptyLayout({ children }) {
  const proseClasses = ["flex flex-col space-y-4 text-sm"];
  return <div className={proseClasses.join(" ")}>{children}</div>;
}
