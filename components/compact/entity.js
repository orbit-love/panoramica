import React from "react";
import classnames from "classnames";

export default function CompactEntity({ entity, setEntity, active }) {
  const onClick = () => {
    if (active) {
      setEntity(null);
    } else {
      setEntity(entity);
    }
  };
  return (
    <button onClick={onClick} key={entity.id} className="px-1 py-1">
      <div
        className={classnames(
          "py-[5px] bg-opacity-40 flex px-3 space-x-2 font-semibold text-indigo-100 bg-fuchsia-900 rounded rounded-lg",
          {
            "!bg-opacity-100": active,
            "hover:bg-opacity-80": !active,
          }
        )}
      >
        <div>{entity.id}</div>
        <div className="font-light">{entity.count}</div>
      </div>
    </button>
  );
}
