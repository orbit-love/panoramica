import React from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Member from "content/cards/member";
import OrbitLevel from "content/cards/orbit_level";
import WelcomeCard from "content/cards/welcome.mdx";
import MissionCard from "content/cards/mission.mdx";

export default function Selection({ selection, expanded, setExpanded }) {
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

  if (expanded) {
    // hard code hex codes for now so tailwind builds them
    return (
      <div className={`bg-opacity-90 w-80 text-[#eef2ff] bg-[#1D1640] rounded`}>
        <div className="flex relative flex-col py-4 px-5 pointer-events-auto">
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-8"
          >
            <FontAwesomeIcon icon="chevron-down" className=""></FontAwesomeIcon>
          </button>
          {markup}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setExpanded(true)}
          className={`pointer-events-auto text-[${c.whiteColor}] bg-[${c.panelColor}] rounded py-4 px-5`}
        >
          <FontAwesomeIcon icon="lightbulb"></FontAwesomeIcon>
        </button>
      </div>
    );
  }
}
