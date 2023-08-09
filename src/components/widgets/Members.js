import React from "react";
import CompactMember from "src/components/domains/member/Member";
import { Frame, Header } from "src/components/widgets";
import { addMemberWidget } from "src/components/widgets/setup/widgets";
import { gql } from "graphql-tag";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

const GET_MEMBERS = gql`
  query ($projectId: ID!) {
    projects(where: { id: $projectId }) {
      membersConnection(first: 250) {
        edges {
          node {
            globalActor
            globalActorName
            activitiesAggregate {
              count
            }
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
  const {
    data: {
      projects: [{ membersConnection }],
    },
  } = useSuspenseQuery(GET_MEMBERS, {
    variables: {
      projectId,
    },
  });

  var members = membersConnection.edges.map((edge) => edge.node);
  members = members.sort((a, b) => {
    return b.activitiesAggregate.count - a.activitiesAggregate.count;
  });

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
            metrics={true}
            onClick={onClickMember(member)}
          />
        ))}
      </div>
    </Frame>
  );
}
