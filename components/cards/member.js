import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import NameAndIcon from "components/compact/name_and_icon";
import CompactConnections from "components/compact/connections";
import Meter from "components/meter";
import Entity from "components/compact/entity";

export default function Member({
  member,
  community,
  selection,
  setSelection,
  connection,
  setConnection,
  entity,
  setEntity,
}) {
  const color = c.orbitLevelColorScale(member.level);

  // entities could also be returned in the member graph query
  let entities = [];
  for (let [_, entity] of Object.entries(community.entities)) {
    if (entity.members.indexOf(member.globalActor) > -1) {
      entities.push(entity);
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex overflow-hidden items-baseline space-x-1 text-ellipsis whitespace-nowrap">
        <div className="text-lg font-bold">
          <NameAndIcon
            member={member}
            selection={selection}
            setSelection={setSelection}
            setConnection={setConnection}
          />
        </div>
      </div>
      <div className="flex flex-col space-y-[-2px]">
        <div className="flex items-center">
          <div className="w-16 font-semibold text-indigo-400">Love</div>
          <Meter
            icon="square"
            number={member.level}
            value={member.love}
          ></Meter>
        </div>
        <div className="flex items-center">
          <div className="w-16 font-semibold text-indigo-400">Reach</div>
          <Meter
            icon="square"
            number={member.level}
            value={member.reach}
          ></Meter>
        </div>
      </div>
      {entities.length > 0 && (
        <>
          <div className="border-b border-indigo-900" />
          <div className="flex flex-wrap py-1 text-xs">
            {entities.map((anEntity) => (
              <Entity
                key={anEntity.id}
                entity={anEntity}
                setEntity={setEntity}
                active={entity?.id === anEntity.id}
              />
            ))}
          </div>
        </>
      )}
      {member.connectionCount > 0 && (
        <>
          <div className="border-b border-indigo-800" />
          <div className="flex flex-col">
            <CompactConnections
              member={member}
              community={community}
              setSelection={setSelection}
              connection={connection}
              setConnection={setConnection}
            />
          </div>
        </>
      )}
      {false && (
        <>
          <div className="border-b border-indigo-800" />
          <div className="flex flex-col space-y-[-2px]">
            <div className="flex">
              <span className="w-32 text-indigo-400">Actor</span>
              <span>{member.actor}</span>
            </div>
            {member.actorName && (
              <div className="flex">
                <span className="w-32 text-indigo-400">Actor Name</span>
                <span>{member.actorName}</span>
              </div>
            )}
            {member.globalActor && (
              <div className="flex">
                <span className="w-32 text-indigo-400">Global Actor</span>
                <span>{member.globalActor}</span>
              </div>
            )}
            {member.globalActorName && (
              <div className="flex">
                <span className="w-32 text-indigo-400">Global Name</span>
                <span>{member.globalActorName}</span>
              </div>
            )}
          </div>
        </>
      )}
      <div className="border-b border-indigo-900" />
      <div className="flex flex-col space-y-[-2px]">
        <div className="flex font-semibold">
          <span className="w-32 text-indigo-400">Activities</span>
          <span>{member.activityCount}</span>
        </div>
        <div className="flex font-semibold">
          <span className="w-32 text-indigo-400">Connections</span>
          <span>{member.connectionCount}</span>
        </div>
      </div>
    </div>
  );
}
