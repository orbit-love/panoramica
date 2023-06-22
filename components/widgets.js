import React, { useState } from "react";
import classnames from "classnames";

import c from "lib/common";
import Controls from "components/controls";
import Member from "components/cards/member";
import OrbitLevel from "components/cards/orbit_level";
import Mission from "components/cards/mission";
import Info from "components/info";
import Activities from "components/project/activities";
import Selection from "components/compact/selection";
import Entities from "components/console/entities";
import EntityGroup from "lib/community/entityGroup";

import Show from "components/project/show";
import Edit from "components/project/edit";

export default function Widgets(props) {
  const { showPanel, showInfo, community, selection } = props;

  const [editMode, setEditMode] = useState(false);
  const childProps = { editMode, setEditMode };
  const width = "w-[32vw]";
  const height = "h-[40vh]";
  const classes = `flex ${height} p-4 mx-1 overflow-y-scroll overflow-x-hidden space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-90 pointer-events-auto`;

  if (community) {
    var entityGroup = new EntityGroup(props);
    var entities = entityGroup.getFilteredEntities();
  }

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
        className={`w-[100vw] flex absolute bottom-0 left-0 z-10 justify-between items-end p-4 pointer-events-none`}
      >
        <div
          className={classnames(classes, width, {
            hidden: !showPanel || !showInfo,
          })}
        >
          <Info {...props} />
        </div>
        <div
          className={classnames(classes, width, {
            hidden: !showPanel || showInfo,
          })}
        >
          <div
            className={classnames(
              "flex relative flex-col space-y-4 w-full h-full",
              { hidden: editMode }
            )}
          >
            <Show {...props} {...childProps} />
          </div>
          <div
            className={classnames(
              "flex relative flex-col space-y-4 w-full h-full",
              { hidden: !editMode }
            )}
          >
            <Edit {...props} {...childProps} />
          </div>
        </div>
        {community && selection && (
          <>
            <div
              className={classnames(classes, width, "flex relative flex-col", {
                hidden: !showPanel,
              })}
            >
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
              {selection.number && <OrbitLevel level={selection} {...props} />}
              {selection.name === "Mission" && <Mission {...props} />}
            </div>
            <div
              className={classnames("flex flex-col space-y-2", width, {
                hidden: !showPanel,
              })}
            >
              {entities.length > 0 && !selection.globalActor && (
                <div
                  className={classnames(
                    classes,
                    "!h-auto max-h-[150px] !py-2 !px-0"
                  )}
                >
                  <Entities {...props} entities={entities} />
                </div>
              )}
              <div className={classnames(classes, "!h-auto !py-2 !px-0")}>
                <Selection {...props} />
              </div>
              <div className={classnames(classes, "!p-0")}>
                <Activities {...props} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
