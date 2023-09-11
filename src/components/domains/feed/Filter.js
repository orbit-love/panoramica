import React from "react";
import classnames from "classnames";

export default function Filter({
  name,
  values,
  onChange,
  selectClassName,
  capitalNames,
}) {
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <select
      onChange={(e) => onChange(e, name)}
      className={classnames("mb-2", selectClassName)}
    >
      <option value="all">
        {capitalNames
          ? capitalizeFirstLetter(name).replace(/e?s$/, "")
          : `🔖 ${name}`}
      </option>
      {values.map(({ value, count }) => {
        return (
          <option key={value} value={value}>
            {value} ({count})
          </option>
        );
      })}
    </select>
  );
}
