import React from "react";
import CompactMember from "src/components/domains/member/Member";
import { Frame, Header, addMemberWidget } from "src/components/widgets";

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
      <div className="flex flex-col px-4">
        {members.map((member) => (
          <CompactMember
            key={member.globalActor}
            member={member}
            community={community}
            metrics={true}
            onClick={onClickMember(member)}
          />
        ))}
      </div>
    </Frame>
  );
}
