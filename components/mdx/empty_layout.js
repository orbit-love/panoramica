import React from "react";

export default function EmptyLayout({ children }) {
  const proseClasses = [
    "flex flex-col space-y-4 prose prose-headings:text-slate-100 prose-headings:my-0 prose-strong:text-slate-100 text-slate-100 leading-tight prose-li:my-2 prose-p:my-0",
  ];
  return <div className={proseClasses}>{children}</div>;
}
