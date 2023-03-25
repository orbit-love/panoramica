import React from "react";

export default function Placeholder({
  children,
  width = "w-full",
  height = "h-[200px]",
}) {
  return (
    <div
      className={`${width} ${height} px-12 flex flex-col justify-center font-mono text-sm text-center !text-gray-600 bg-violet-100 rounded rounded-md`}
    >
      {children.props && children.props.children}
      {!children.props && children}
    </div>
  );
}
