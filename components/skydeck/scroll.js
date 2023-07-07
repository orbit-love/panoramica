import React from "react";

export default function Scroll({ children }) {
  return (
    <div className="overflow-x-hidden overflow-y-scroll h-full break-words">
      {children}
    </div>
  );
}
