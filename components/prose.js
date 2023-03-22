import React from "react";

export default function Prose({ children }) {
  // const proseClasses = [
  //   "prose",
  //   "prose-lg",
  //   "prose-h1:text-4xl",
  //   "prose-h2:text-3xl",
  //   "prose-h1:bg-opacity-50",
  //   "prose-h2:bg-opacity-50",
  //   "prose-h3:mb-2",
  //   "prose-h3:text-2xl",
  //   "prose-h4:text-xl",
  //   "prose-h4:mb-0",
  //   "prose-headings:p-1",
  //   "prose-headings:pl-3",
  //   "prose-headings:-ml-3",
  //   "prose-a:underline",
  //   "prose-strong:font-semibold",
  //   "dark:prose-invert",
  //   "prose-ul:my-6",
  //   "prose-ol:my-6",
  //   "prose-li:my-0",
  //   "prose-th:pl-0",
  //   "prose-th:pb-3",
  //   "prose-td:pl-0",
  //   "pb-12",
  // ];
  const proseClasses = ["prose", "prose-h2:text-3xl", "prose-h3:text-2xl"];
  return <div className={proseClasses.join(" ")}>{children}</div>;
}
