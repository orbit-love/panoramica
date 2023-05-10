import React from "react";
import Member from "content/cards/member";

export default function Selection({ selection }) {
  // hard code hex codes for now so tailwind builds them
  console.log("Selection rendering...", selection);
  if (selection && selection.level) {
    return (
      <div className={`bg-opacity-90 w-80 text-[#eef2ff] bg-[#1D1640] rounded`}>
        <div className="flex relative flex-col py-6 px-7 pointer-events-auto">
          <Member selection={selection} />
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
