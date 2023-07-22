import React from "react";
import CompactMember from "src/components/domains/member/Member";
import { Frame, Header, addMemberWidget } from "src/components/widgets";

export default function Members({ community, addWidget }) {
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
        <div className="text-lg">Members</div>
        <div className="">{members.length}</div>
      </Header>
      <div className="flex flex-col px-6">
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
