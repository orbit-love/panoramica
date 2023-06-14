import React from "react";
import c from "lib/common";
import classnames from "classnames";
import OrbitLevelIcon from "components/icons/orbit_level";
import NumberStats from "components/compact/number_stats";
import NameAndIcon from "components/compact/name_and_icon";

export default function CompactMember({
  member,
  setSelection,
  metrics,
  setConnection,
}) {
  const onClick = () => {
    setConnection(null);
    setSelection(member);
  };
  return (
    <button
      onClick={onClick}
      className="bg-opacity-0 hover:bg-opacity-50 flex justify-between space-x-1 bg-indigo-900"
    >
      <div
        className={classnames("flex items-center space-x-1", {
          "max-w-[50%] overflow-hidden text-ellipsis": metrics,
        })}
      >
        <NameAndIcon
          member={member}
          setSelection={setSelection}
          setConnection={setConnection}
          onClick={() => {}}
        />
      </div>
      <div className="mx-auto" />
      {metrics && <NumberStats member={member} />}
    </button>
  );
}
