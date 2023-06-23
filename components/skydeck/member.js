import React from "react";

import Feed from "lib/community/feed";
import NameAndIcon from "components/compact/name_and_icon";
import {
  Frame,
  Scroll,
  Header,
  Activities,
  Connection,
} from "components/skydeck";
import Meter from "components/meter";
import Entity from "components/compact/entity";
import CompactConnections from "components/compact/connections";

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
              <div className="flex flex-wrap py-1 px-4 text-xs">
                {entities.map((entity) => (
                  <Entity
                    key={entity.id}
                    entity={entity}
                    active={false}
                    onClick={() => {}}
                  />
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
