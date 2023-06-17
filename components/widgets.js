import React, { useState } from "react";

import c from "lib/common";
import Controls from "components/controls";
import Member from "components/cards/member";
import OrbitLevel from "components/cards/orbit_level";
import Mission from "components/cards/mission";
import Info from "components/info";
import ActivityTabs from "components/project/activityTabs";
import Selection from "components/compact/selection";

import Show from "components/project/show";
import Edit from "components/project/edit";

export default function Widgets(props) {
  const [editMode, setEditMode] = useState(false);
  const childProps = { editMode, setEditMode };
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
              <>
                <div className={`${classes} ${width}`}>
                  <div className="flex relative flex-col space-y-4 w-full h-full">
                    {!editMode && <Show {...props} {...childProps} />}
                    {editMode && <Edit {...props} {...childProps} />}
                  </div>
                </div>
              </>
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
              <div className="flex flex-col space-y-2">
                <div className={`${classes} ${width} !h-auto !py-2 !px-0`}>
                  <Selection {...props} />
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
