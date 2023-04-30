import React from "react";
import Member from "content/cards/member";
import OrbitLevel from "content/cards/orbit_level";
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
    <>
      {markup && (
        <div className={`bg-opacity-90 w-80 bg-indigo-100 rounded`}>
          <div className="flex relative flex-col py-4 px-5 pointer-events-auto">
            {markup}
          </div>
        </div>
      )}
    </>
  );
}
