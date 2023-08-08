import React from "react";
import CompactMember from "src/components/domains/member/Member";
import { Frame, Header } from "src/components/widgets";
import { addMemberWidget } from "src/components/widgets/setup/widgets";
import { gql } from "graphql-tag";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

const GET_MEMBERS = gql`
  query ($projectId: ID!) {
    project(id: $projectId) {
      id
      name
      membersConnection(first: 250) {
        edges {
          cursor
          node {
            id
            globalActor
            globalActorName
          }
        }
      }
    }
  }
`;

export default function Members({ project, addWidget }) {
  let onClickMember = (member) => {
    return (e) => {
      e.stopPropagation();
      addMemberWidget(member, addWidget);
    };
  };

  const { id: projectId } = project;
  const { data } = useSuspenseQuery(GET_MEMBERS, {
    variables: {
      projectId,
    },
  });

  const members =
    data?.project?.membersConnection?.edges?.map((edge) => edge.node) || [];

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
            metrics={false}
            onClick={onClickMember(member)}
          />
        ))}
      </div>
    </Frame>
  );
}
