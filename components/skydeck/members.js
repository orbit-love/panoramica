import React from "react";
import CompactMember from "components/compact/member";
import { Frame, Scroll, Header, Member } from "components/skydeck";

export default function Members(props) {
  let { community, widgets, setWidgets } = props;
  let { members } = community;
  let onClickFor = (member) => {
    return () => {
      setWidgets([
        ...widgets.slice(0, 1),
        (props) => (
          <Member
            key={member.globalActor}
            title={member.globalActorName}
            member={member}
            {...props}
          />
        ),
        ...widgets.slice(1, widgets.length),
      ]);
    };
  };
  return (
    <Frame>
      <Header length={members.length} {...props}>
        Members
      </Header>
      <Scroll>
        <div className="flex flex-col px-4">
          {[1, 2, 3, 4].map((number) => (
            <div key={number} className="flex flex-col">
              {members
                .filter((member) => member.level === number)
                .map((member) => (
                  <CompactMember
                    key={member.globalActor}
                    member={member}
                    community={community}
                    metrics={true}
                    onClick={onClickFor(member)}
                  />
                ))}
            </div>
          ))}
        </div>
      </Scroll>
    </Frame>
  );
}
