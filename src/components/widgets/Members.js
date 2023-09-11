import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import CompactMember from "src/components/domains/member/Member";
import { Frame, Header } from "src/components/widgets";
import { addMemberWidget } from "src/components/widgets/setup/widgets";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetMembersQuery from "./Members/GetMembers.gql";
import Loader from "src/components/domains/ui/Loader";

export default function Members({ project, addWidget }) {
  const pageSize = 50;
  const defaultSort = { conversationCount: "DESC" };

  const [first, setFirst] = useState(pageSize);
  const [members, setMembers] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [totalCount, setTotalCount] = useState(null);
  const [sort, setSort] = useState(defaultSort);

  let onClickMember = (member) => {
    return (e) => {
      e.stopPropagation();
      addMemberWidget(member, addWidget);
    };
  };

  const { id: projectId } = project;
  const { loading, fetchMore } = useQuery(GetMembersQuery, {
    variables: {
      projectId,
      first,
      sort,
    },
    onCompleted: (data) => {
      const {
        projects: [
          {
            membersConnection: { edges, pageInfo, totalCount },
          },
        ],
      } = data;

      setMembers(edges.map(({ node: member }) => member));
      setPageInfo(pageInfo);
      setTotalCount(totalCount);
    },
  });

  useEffect(() => {
    fetchMore({
      variables: {
        first,
        sort,
      },
    });
  }, [first, sort, fetchMore]);

  const { hasNextPage } = pageInfo;

  const changeSort = useCallback(
    (sort) => {
      setFirst(pageSize);
      setSort(sort);
    },
    [setFirst, setSort]
  );

  return (
    <Frame>
      <Header>
        <div className="flex justify-between items-baseline w-full">
          <div className="text-lg">
            Members{" "}
            {members.length > 0 && totalCount > 0 && (
              <span>
                {members.length}/{totalCount}
              </span>
            )}
          </div>
          {totalCount > 0 && (
            <div className="flex items-baseline space-x-3 text-sm whitespace-nowrap">
              <div className="grow" />
              <div className="text-tertiary">Sort by: </div>
              <div
                className={classnames("", {
                  "cursor-pointer underline text-gray-400":
                    !sort.conversationCount,
                  "text-tertiary": sort.conversationCount,
                })}
                onClick={() => {
                  if (!sort.conversationCount)
                    changeSort({ conversationCount: "DESC" });
                }}
              >
                <FontAwesomeIcon
                  icon="comment"
                  flip="horizontal"
                  className="mr-1"
                />
                <span>Conversations</span>
              </div>
              <div
                className={classnames("", {
                  "cursor-pointer underline text-gray-400":
                    !sort.messagedWithCount,
                  "text-tertiary": sort.messagedWithCount,
                })}
                onClick={() => {
                  if (!sort.messagedWithCount)
                    changeSort({ messagedWithCount: "DESC" });
                }}
              >
                <FontAwesomeIcon icon="right-left" className="mr-1" />
                <span>Connections</span>
              </div>
            </div>
          )}
        </div>
      </Header>
      <div className="flex flex-col px-6 space-y-4">
        <div className="flex flex-col">
          {members.map((member) => (
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
        {loading && <Loader />}
        {hasNextPage && !loading && (
          <div className="flex justify-center">
            <button
              className="btn !w-auto text-sm"
              onClick={() => setFirst((first) => first + pageSize)}
            >
              Load more
            </button>
          </div>
        )}
        {!hasNextPage && !loading && members.length > 0 && (
          <p className="my-5 text-center">♥</p>
        )}
        <div />
      </div>
    </Frame>
  );
}
