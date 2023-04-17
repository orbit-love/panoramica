import React from "react";
import c from "components/2023/common";

export default function OrbitLevel({ selection }) {
  return (
    <>
      <div className="text-xl font-bold">{selection.name}</div>
      {selection.description && (
        <div className="my-3 text-sm leading-tight">
          {selection.description}
        </div>
      )}
    </>
  );
}
