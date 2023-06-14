import React from "react";
import Entity from "components/compact/entity";

export default function Console({ community, entity, setEntity }) {
  var entities = community.entities;
  return (
    <div className="flex overflow-scroll flex-col space-y-2 w-full">
      <div className="flex justify-between items-baseline px-4 pt-4 space-x-2 whitespace-nowrap">
        <span className="text-lg font-bold text-ellipsis">Entities</span>
      </div>
      <div className="mx-4 border-b border-indigo-900" />
      <div className="flex flex-wrap py-1 px-4 text-xs">
        {entities.map((anEntity) => (
          <div key={anEntity.id} className="">
            <Entity
              entity={anEntity}
              setEntity={setEntity}
              active={entity?.id === anEntity.id}
            />
          </div>
        ))}
      </div>
      {entities.length === 0 && (
        <div className="px-4 text-indigo-500">No entities.</div>
      )}
    </div>
  );
}
