import React from "react";

import c from "lib/common";
import Controls from "components/controls";
import Member from "components/cards/member";
import OrbitLevel from "components/cards/orbit_level";
import Mission from "components/cards/mission";
import Info from "components/info";
import List from "components/simulation/list";
import Entities from "components/console/entities";
import ActivityTabs from "components/simulation/activityTabs";

export default function Widgets(props) {
  const { showPanel, showInfo, community, selection } = props;
  const width = "w-[32vw]";
  const height = "h-[40vh]";
  const classes = `flex ${height} px-4 py-4 overflow-scroll space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-90 pointer-events-auto`;

  const DControls = () => (
    <div className={`flex absolute top-0 right-0 z-10 p-5 space-x-4`}>
      <div className={`${classes} py-4 px-5 h-auto pointer-events-auto`}>
        <Controls {...props} />
      </div>
    </div>
  );

  return (
    <>
      <DControls />
      <div
        className={`w-[100vw] flex absolute bottom-0 left-0 z-10 justify-between items-end p-5 space-x-4 pointer-events-none`}
      >
        {showPanel && (
          <>
            {showInfo && (
              <div className={`${classes} ${width}`}>
                <Info {...props} />
              </div>
            )}
            {!showInfo && (
              <div className={`${classes} ${width}`}>
                <List {...props} />
              </div>
            )}
            {community && selection && (
              <div className={`${classes} ${width} flex relative flex-col`}>
                {typeof selection.level === "number" && (
                  <Member
                    member={
                      community.members.find(
                        (member) => selection.id === member.id
                      ) || selection
                    }
                    {...props}
                  />
                )}
                {selection.number && (
                  <OrbitLevel level={selection} {...props} />
                )}
                {selection.name === "Mission" && <Mission {...props} />}
              </div>
            )}
            {community && selection && (
              <div className="flex flex-col space-y-4">
                <div className={`${classes} ${width} !h-[250px] !p-0`}>
                  <Entities {...props} />
                </div>
                <div className={`${classes} ${width} !p-0`}>
                  <ActivityTabs {...props} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
