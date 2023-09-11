import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import TimeAgo from "react-timeago";

import { Frame } from "src/components/widgets";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";
import GetMessagedWithConnectionQuery from "./Connection/GetMessagedWithConnection.gql";
import GetConversationsByIdsQuery from "src/graphql/queries/GetConversationsByIds.gql";
import utils from "src/utils";

export default function Connection({ project, params, handlers }) {
  return (
    <React.Suspense fallback={<></>}>
      <ConnectionInner project={project} params={params} handlers={handlers} />
    </React.Suspense>
  );
}

function ConnectionInner({ project, params, handlers }) {
  var { member, connection } = params;
  var { onClickMember } = handlers;

  const { id: projectId } = project;
  const { id: memberId } = member;
  const { id: connectionId } = connection;

  const {
    data: {
      projects: [
        {
          members: [
            {
              messagedWithConnection: {
                edges: [
                  {
                    activityCount,
                    conversationCount,
                    lastInteractedAt,
                    conversationIds,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  } = useSuspenseQuery(GetMessagedWithConnectionQuery, {
    variables: { projectId, memberId, connectionId },
  });

  const { data: idsQueryData } = useSuspenseQuery(GetConversationsByIdsQuery, {
    variables: { projectId, ids: conversationIds },
  });

  const conversations = idsQueryData?.projects[0].conversations || [];

  const latestActivityByEitherMember = (conversation) => {
    return conversation.descendants
      .reverse()
      .find((a) => [memberId, connectionId].includes(a.member.id));
  };

  return (
    <Frame>
      <div className="px-6 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-lg">
            <NameAndIcon
              member={member}
              onClick={onClickMember}
              hideActor={true}
            />
            <FontAwesomeIcon
              icon="right-left"
              className="text-secondary text-sm"
            />
            <NameAndIcon
              member={connection}
              onClick={onClickMember}
              hideActor={true}
            />
          </div>
          <div
            title={`Messaged ${activityCount} times across ${conversationCount} conversations`}
            className="text-secondary text-lg"
          >
            <FontAwesomeIcon icon="comment" flip="horizontal" />
            &nbsp;
            <span title={activityCount}>{conversationCount}</span>
          </div>
        </div>
        <div className="text-gray-400 dark:text-gray-600">
          <span>Last interacted: </span>
          <TimeAgo
            date={lastInteractedAt}
            title={`Last interacted on ${utils.formatDate(lastInteractedAt)}`}
          />
        </div>
      </div>
      {conversations.map((conversation) => (
        <ConversationFeedItem
          key={conversation.id}
          activity={latestActivityByEitherMember(conversation)}
          conversation={conversation}
          project={project}
          handlers={handlers}
        />
      ))}
    </Frame>
  );
}
