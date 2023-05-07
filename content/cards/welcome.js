import React from "react";
import helper from "lib/orbitHelper";
import * as d3 from "d3";
import WelcomeText from "content/cards/welcome.mdx";

export default function WelcomeCard({ svgRef, bodies, setSelection }) {
  return (
    <div className="flex flex-col space-y-6">
      <WelcomeText />
      <button
        className="px-2 py-2 text-sm font-semibold bg-indigo-700 rounded-md"
        onClick={() => {
          const svg = d3.select(svgRef.current);
          helper.clearSelection(svg);
          const imogene = bodies[0];
          imogene.description = "To be continued!";
          helper.highlightSelection(`g.body-group#${imogene.id}`);
          setSelection(imogene);
        }}
      >
        Start exploring...
      </button>
    </div>
  );
}
