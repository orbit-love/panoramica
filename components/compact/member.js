import React from "react";
import c from "lib/common";
import classnames from "classnames";
import OrbitLevelIcon from "components/icons/orbit_level";
import NumberStats from "components/compact/number_stats";

export default function CompactMember({
  member,
  setSelection,
  metrics,
  setConnection,
}) {
  return (
    <button
      className="p-[1px]"
      key={member.id}
      onClick={() => {
        setConnection(null);
        setSelection(member);
      }}
    >
      <div className="bg-opacity-0 hover:bg-opacity-50 flex justify-between space-x-1 bg-indigo-900">
        <div
          className={classnames("flex items-center space-x-1", {
            "max-w-[50%]": metrics,
          })}
        >
          <OrbitLevelIcon number={member.level} />
          <div
            className="overflow-hidden text-left text-ellipsis whitespace-nowrap"
            style={{
              color: c.orbitLevelColorScale(member.level),
            }}
          >
            {member.globalActorName}
          </div>
        </div>
        <div className="mx-auto" />
        {metrics && <NumberStats member={member} />}
      </div>
    </button>
  );
}
