import React from "react";
import c from "components/2023/common";

export default function Selection({ selection }) {
  var markup = null;
  console.log(selection);
  if (!selection) {
    markup = <div className="text-lg">Welcome!</div>;
  } else if (selection.name === "Mission") {
    markup = <div className="text-lg">The Mission</div>;
  } else if (selection.distance) {
    markup = <div className="text-lg">{selection.name}</div>;
  } else if (selection.orbit) {
    markup = <div className="text-lg">{selection.name}</div>;
  }

  return (
    <div className="flex absolute right-0 bottom-0 z-10 flex-col justify-start px-3 py-4 space-y-6 pointer-events-none">
      <div className={`${c.panelBackgroundClasses}`}>
        <div className="flex relative flex-col py-1 px-4 pointer-events-auto">
          {markup}
        </div>
      </div>
    </div>
  );
}
