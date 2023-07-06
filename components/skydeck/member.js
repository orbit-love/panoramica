import React from "react";

import Feed from "lib/community/feed";
import NameAndIcon from "components/compact/name_and_icon";
import { Frame, Scroll, Header, Connection } from "components/skydeck";
import Meter from "components/meter";
import CompactEntity from "components/compact/entity";
import Activities from "components/compact/activities";
import CompactConnections from "components/compact/connections";
import { addEntityWidget } from "components/skydeck";

export default function Member(props) {
  var { member, community, addWidget } = props;
  var feed = new Feed({ selection: member, ...props });
  var activities = feed.getFilteredActivities();

  let entities = [];
  for (let [_, entity] of Object.entries(community.entities)) {
    if (entity.members.indexOf(member.globalActor) > -1) {
      entities.push(entity);
    }
  }

  let onClickConnection = (connection) => {
    addWidget((props) => (
      <Connection member={member} connection={connection} {...props} />
    ));
  };

  let onClickEntity = (entity) => () => addEntityWidget(entity, addWidget);

  return (
    <Frame>
      <Header {...props}>
        <NameAndIcon member={member} onClick={() => {}} />
      </Header>
      <Scroll>
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
                      onClick={onClickEntity(entity)}
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
                  onClick={onClickConnection}
                />
              </div>
              <div className="border-b border-indigo-900" />
            </>
          )}
          <Activities activities={activities} {...props} />
        </div>
      </Scroll>
    </Frame>
  );
}
