import React from "react";
import classnames from "classnames";
import NumberStats from "src/components/domains/member/NumberStats";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

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
    <button onClick={onClick} className="group flex justify-between space-x-1">
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
