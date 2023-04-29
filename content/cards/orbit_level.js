import React from "react";

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
