import React from "react";
import c from "components/2023/common";
import Member from "components/2023/member_new";
import Mission from "components/2023/mission";
import OrbitLevel from "components/2023/orbit_level";
import Welcome from "components/2023/welcome";

export default function Selection({ selection }) {
  var markup = null;
  if (!selection) {
    markup = <Welcome />;
  } else if (selection.name === "Mission") {
    markup = <Mission />;
  } else if (selection.distance) {
    markup = <OrbitLevel selection={selection} />;
  } else if (selection.orbit) {
    markup = <Member selection={selection} />;
  }

  return (
    <div className="flex absolute right-0 bottom-0 z-10 flex-col justify-start px-3 py-4 space-y-6 pointer-events-none">
      <div className={`${c.panelBackgroundClasses} bg-opacity-80 rounded`}>
        <div className="flex relative flex-col py-3 px-4 pointer-events-auto">
          {markup}
        </div>
      </div>
    </div>
  );
}
