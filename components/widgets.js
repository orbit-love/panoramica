import React, { useState } from "react";
import classnames from "classnames";

import c from "lib/common";
import Controls from "components/controls";
import Info from "components/info";
import EntityGroup from "lib/community/entityGroup";

import Show from "components/project/show";
import Edit from "components/project/edit";

export default function Widgets(props) {
  const { showPanel, showInfo, community, setProject } = props;

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
            <Edit
              {...props}
              {...childProps}
              onUpdate={(project) => {
                setProject(project);
                setEditMode(false);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
