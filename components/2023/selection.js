import React from "react";
import c from "components/2023/common";

export default function Selection({ selection }) {
  return (
    <div className="flex absolute right-0 bottom-0 z-10 flex-col justify-start px-3 py-4 space-y-6 pointer-events-none">
      <div className={`${c.panelBackgroundClasses}`}>
        <div className="flex relative flex-col py-1 px-4 pointer-events-auto">
          <div className="text-lg">{selection.name}</div>
        </div>
      </div>
    </div>
  );
}
