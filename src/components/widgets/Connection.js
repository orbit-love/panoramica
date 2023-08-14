import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import TimeAgo from "react-timeago";

import { Frame } from "src/components/widgets";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";
import GetActivityIdsQuery from "./Connection/GetActivityIds.gql";
import GetActivitiesByIdsQuery from "src/components/domains/search/GetActivitiesByIds.gql";
import utils from "src/utils";

export default function Connection({ project, params, handlers }) {
  var { member, connection } = params;
  var { onClickMember } = handlers;

  const { id: projectId } = project;
  const { globalActor: memberId } = member;
  const { globalActor: connectionId } = connection;

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
                    conversations: ids,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  } = useSuspenseQuery(GetActivityIdsQuery, {
    variables: { projectId, memberId, connectionId },
  });

  const { data: idsQueryData } = useSuspenseQuery(GetActivitiesByIdsQuery, {
    variables: { projectId, ids },
  });

  const activities = idsQueryData?.projects[0].activities || [];

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
      {activities.map((activity) => (
        <ConversationFeedItem
          key={activity.id}
          activity={activity}
          project={project}
          handlers={handlers}
        />
      ))}
    </Frame>
  );
}
