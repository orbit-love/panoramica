import React from "react";

import NameAndIcon from "src/components/domain/NameAndIcon";
import { Frame, Header, ActivityFeed } from "src/components";
import Meter from "src/components/meter";
import CompactEntity from "src/components/domain/entity";
import CompactConnections from "src/components/domain/connections";

export default function Member({ community, api, params, handlers }) {
  var { member } = params;
  var { onClickConnection, onClickEntity } = handlers;

  // this will allow the feed to render the latest activity by this
  // member in each thread, preventing other thread noise from
  // obscuring how the member was involved
  var activities = community.activities.filter(
    (activity) => activity.globalActor === member.globalActor
  );

  // an alternative would be only showing their activities and linking to conversations
  // or showing a conversation summary view; what is nice is to see the members / topics
  // var activities = community.activities.filter(activity => activity.globalActor === member.globalActor);

  let entities = [];
  for (let [_, entity] of Object.entries(community.entities)) {
    if (entity.members.indexOf(member.globalActor) > -1) {
      entities.push(entity);
    }
  }

  return (
    <Frame>
      <Header>
        <NameAndIcon member={member} onClick={() => {}} />
      </Header>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col px-4 space-y-[-2px]">
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
        <div className="h-[1px] bg-indigo-900" />
        {entities.length > 0 && (
          <>
            <div className="flex flex-wrap px-4 text-xs">
              {entities.map((entity) => (
                <div className="px-1 py-1" key={entity.id}>
                  <CompactEntity
                    entity={entity}
                    active={false}
                    onClick={(e) => onClickEntity(e, entity)}
                  />
                </div>
              ))}
            </div>
            <div className="border-b border-indigo-900" />
          </>
        )}
        {member.connectionCount > 0 && (
          <>
            <div className="flex flex-col px-4">
              <CompactConnections
                member={member}
                community={community}
                onClick={(e, member, connection) =>
                  onClickConnection(e, member, connection)
                }
              />
            </div>
            <div className="border-b border-indigo-900" />
          </>
        )}
        <ActivityFeed
          activities={activities}
          community={community}
          handlers={handlers}
        />
      </div>
    </Frame>
  );
}
