import React, { useState, useEffect } from "react";
import CompactMember from "src/components/domains/member/Member";
import { Frame, Header } from "src/components/widgets";
import { addMemberWidget } from "src/components/widgets/setup/widgets";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetMembersQuery from "./Members/GetMembers.gql";

export default function Members({ project, addWidget }) {
  const [first, setFirst] = useState(100);

  let onClickMember = (member) => {
    return (e) => {
      e.stopPropagation();
      addMemberWidget(member, addWidget);
    };
  };

  const { id: projectId } = project;
  const {
    data: {
      projects: [
        {
          membersConnection: {
            edges,
            pageInfo: { hasNextPage },
            totalCount,
          },
        },
      ],
    },
    fetchMore,
  } = useSuspenseQuery(GetMembersQuery, {
    variables: {
      projectId,
      first,
    },
  });

  useEffect(() => {
    fetchMore({
      variables: {
        first,
      },
    });
  }, [first, fetchMore]);

  const sortedEdges = edges.sort(({ node: a }, { node: b }) => {
    return b.activitiesAggregate.count - a.activitiesAggregate.count;
  });

  return (
    <Frame>
      <Header>
        <div className="flex justify-between items-baseline w-full">
          <div className="text-lg">Members</div>
          <div className="">
            Showing {edges.length}/{totalCount}
          </div>
        </div>
      </Header>
      <div className="flex flex-col px-6 space-y-4">
        <div className="flex flex-col">
          {sortedEdges.map(({ node: member }) => (
            <CompactMember
              key={member.globalActor}
              member={member}
              metrics={true}
              onClick={onClickMember(member)}
              activityCount={member.activitiesAggregate.count}
              connectionCount={member.messagedWithConnection.totalCount}
            />
          ))}
        </div>
        {hasNextPage && (
          <div className="flex justify-center">
            <button
              className="btn !w-auto text-sm"
              onClick={() => setFirst(first + 100)}
            >
              Load more
            </button>
          </div>
        )}
        {!hasNextPage && <p className="my-5 text-center">♥</p>}
        <div />
      </div>
    </Frame>
  );
}
