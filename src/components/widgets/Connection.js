import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useLazyQuery } from "@apollo/client";
import TimeAgo from "react-timeago";

import { Frame } from "src/components/widgets";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";
import GetMessagedWithConnectionQuery from "./Connection/GetMessagedWithConnection.gql";
import GetConversationsByIdsQuery from "src/graphql/queries/GetConversationsByIds.gql";
import utils from "src/utils";
import Loader from "../domains/ui/Loader";

export default function Connection({ project, params, handlers }) {
  const { member, connection } = params;
  const { onClickMember } = handlers;
  const { id: projectId } = project;
  const { id: memberId } = member;
  const { id: connectionId } = connection;
  const [edge, setEdge] = React.useState({});
  const [conversations, setConversations] = React.useState([]);

  const [getConversationsByIdQuery] = useLazyQuery(GetConversationsByIdsQuery, {
    variables: { projectId },
  });

  const { loading } = useQuery(GetMessagedWithConnectionQuery, {
    variables: { projectId, memberId, connectionId },
    onCompleted: async (data) => {
      const {
        projects: [
          {
            members: [
              {
                messagedWithConnection: {
                  edges: [edge],
                },
              },
            ],
          },
        ],
      } = data;
      setEdge(edge);

      const { conversationIds: ids } = edge;
      const {
        data: {
          projects: [{ conversations }],
        },
      } = await getConversationsByIdQuery({
        variables: { ids },
      });
      setConversations(conversations);
    },
  });

  const { activityCount, conversationCount, lastInteractedAt } = edge;

  const latestActivityByEitherMember = (conversation) => {
    return conversation.descendants
      .slice()
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
        {lastInteractedAt && (
          <div className="text-gray-400 dark:text-gray-600">
            <span>Last interacted: </span>
            <TimeAgo
              date={lastInteractedAt}
              title={`Last interacted on ${utils.formatDate(lastInteractedAt)}`}
            />
          </div>
        )}
      </div>
      {loading && (
        <div className="px-6">
          <Loader />
        </div>
      )}
      {!loading &&
        conversations.map((conversation) => (
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
