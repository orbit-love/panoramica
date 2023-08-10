import React, { useState, useEffect } from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import Paginator from "src/components/domains/feed/Paginator";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";

const findActivitiesConnectionEdges = ({
  projects: [
    {
      activitiesConnection: { edges, pageInfo },
    },
  ],
}) => {
  return [edges, pageInfo];
};

export default function ConversationFeed({
  project,
  query,
  variables,
  handlers,
  term,
  eachActivity,
  findEdges = findActivitiesConnectionEdges,
  className = "border-t border-gray-300 dark:border-gray-700",
}) {
  const [first, setFirst] = useState(10);

  const { data, fetchMore } = useSuspenseQuery(query, {
    variables: { ...variables, first },
  });

  const [edges, pageInfo] = findEdges(data);

  if (!eachActivity) {
    eachActivity = ({ activity, index }) => (
      <ConversationFeedItem
        project={project}
        key={activity.id}
        index={index}
        activity={activity}
        handlers={handlers}
        term={term}
      />
    );
  }

  useEffect(() => {
    fetchMore({
      variables: {
        first,
      },
    });
  }, [first, fetchMore]);

  var activities = edges.map((edge) => edge.node);

  // keep only the first activity in a conversation
  const conversationIds = activities.map((a) => a.conversation.id);
  activities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversation.id) === index;
  });

  return (
    <div className={className}>
      <Paginator
        activities={activities}
        setFirst={setFirst}
        pageInfo={pageInfo}
        eachActivity={eachActivity}
      />
    </div>
  );
}
