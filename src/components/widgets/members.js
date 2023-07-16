import React from "react";
import CompactMember from "src/components/domain/member";
import { Frame, Scroll, Header, addMemberWidget } from "src/components";

export default function Members({ community, addWidget, api }) {
  let { members } = community;
  let onClickMember = (member) => {
    return (e) => {
      e.stopPropagation();
      addMemberWidget(member, addWidget);
    };
  };

  return (
    <Frame>
      <Header>
        <div>Members</div>
        <div className="text-indigo-500">{members.length}</div>
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
                    onClick={onClickMember(member)}
                  />
                ))}
            </div>
          ))}
        </div>
      </Scroll>
    </Frame>
  );
}
