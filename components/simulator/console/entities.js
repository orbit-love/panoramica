import React from "react";
import classnames from "classnames";

import NameAndIcon from "components/compact/name_and_icon";

function Entity({ entity, community, setSelection, setConnection }) {
  let onClick = () => {};
  return (
    <button onClick={onClick} key={entity.id} className="px-1 py-1">
      <div className="font-semibold text-sm flex space-x-2 py-[4px] px-4 bg-opacity-60 text-indigo-100 bg-fuchsia-900 hover:bg-opacity-100 rounded rounded-lg">
        <div>{entity.id}</div>
        <div className="font-light">{entity.count}</div>
      </div>
      <div className="hidden flex flex-wrap">
        {entity.members.map((globalActor) => {
          let member = community.findMemberByActor(globalActor);
          if (member) {
            return (
              <div className="pr-2 text-sm" key={member.globalActor}>
                <NameAndIcon
                  member={member}
                  setConnection={setConnection}
                  setSelection={setSelection}
                />
              </div>
            );
          }
        })}
      </div>
    </button>
  );
}

export default function Console({ community, setSelection, setConnection }) {
  var entities = community.entities;
  return (
    <div className="flex overflow-scroll flex-col space-y-2 w-full">
      <div className="flex justify-between items-baseline px-4 pt-4 space-x-2 whitespace-nowrap">
        <span className="text-lg font-bold text-ellipsis">Entities</span>
      </div>
      <div className="mx-4 border-b border-indigo-900" />
      <div className="flex flex-wrap px-4 py-1">
        {entities.map((entity) => (
          <div key={entity.id} className="">
            <Entity
              entity={entity}
              community={community}
              setSelection={setSelection}
              setConnection={setConnection}
            />
          </div>
        ))}
      </div>
      {entities.length === 0 && (
        <div className="py-3 px-4 text-indigo-500">No entities.</div>
      )}
    </div>
  );
}
