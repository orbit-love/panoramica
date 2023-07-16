import React from "react";
import classnames from "classnames";
import NumberStats from "components/compact/number_stats";
import NameAndIcon from "components/compact/name_and_icon";

export default function CompactMember({
  member,
  selection,
  setSelection,
  metrics,
  setConnection,
  onClick,
}) {
  if (!onClick) {
    onClick = () => {
      setConnection(null);
      setSelection(member);
    };
  }
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
          selection={selection}
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
