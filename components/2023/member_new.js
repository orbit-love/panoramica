import React from "react";
import c from "components/2023/common";

export default function Member({ selection }) {
  return (
    <>
      <div className="text-xl font-bold">{selection.name}</div>
      <div className="text-sm">Orbit Level: {selection.level}</div>
      <div className="text-sm">Love: {selection.love}</div>
      <div className="text-sm">Reach: {selection.reach}</div>
      {selection.description && (
        <div className="my-3 text-sm leading-tight">
          {selection.description}
        </div>
      )}
    </>
  );
}
