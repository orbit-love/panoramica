import React from "react";

export default function Member({ selection }) {
  return (
    <>
      <div className="mb-2 text-xl font-bold">{selection.name}</div>
      <div className="flex flex-wrap justify-between space-x-4">
        <div className="text-sm font-semibold">
          Orbit Level: {selection.level}
        </div>
        <div className="text-sm font-semibold">Love: {selection.love}</div>
        <div className="text-sm font-semibold">Reach: {selection.reach}</div>
      </div>
      {selection.description && (
        <div className="my-3 text-sm leading-tight">
          {selection.description}
        </div>
      )}
    </>
  );
}
