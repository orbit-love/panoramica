import React from "react";
import c from "components/2023/common";
import Member from "components/2023/member_new";
import OrbitLevel from "components/2023/orbit_level";
import WelcomeCard from "content/cards/welcome.mdx";
import MissionCard from "content/cards/mission.mdx";

export default function Selection({ selection }) {
  var markup = null;
  if (!selection) {
    markup = <WelcomeCard />;
  } else if (selection.name === "Mission") {
    markup = <MissionCard />;
  } else if (selection.distance) {
    markup = <OrbitLevel selection={selection} />;
  } else if (selection.orbit) {
    markup = <Member selection={selection} />;
  } else if (selection === {}) {
    markup = null;
  }

  return (
    <div className="flex absolute right-0 bottom-0 z-10 flex-col justify-start px-4 py-5 space-y-6 pointer-events-none">
      {markup && (
        <div className={`bg-opacity-80 w-80 bg-indigo-100 rounded`}>
          <div className="flex relative flex-col py-4 px-5 pointer-events-auto">
            {markup}
          </div>
        </div>
      )}
    </div>
  );
}
