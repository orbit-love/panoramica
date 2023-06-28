import React from "react";
import Entity from "components/compact/entity";

export default function Entities({ entities, entity, setEntity }) {
  return (
    <div className="flex overflow-scroll flex-col space-y-2 w-full">
      <div className="flex flex-wrap py-1 px-4 text-xs">
        {entities.map((anEntity) => (
          <div key={anEntity.id} className="px-1 py-1">
            <Entity
              entity={anEntity}
              setEntity={setEntity}
              active={entity?.id === anEntity.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
