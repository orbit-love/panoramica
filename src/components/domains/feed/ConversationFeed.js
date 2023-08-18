import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import Paginator from "src/components/domains/feed/Paginator";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";
import Loader from "../ui/Loader";

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
  minimal,
  term,
  eachActivity,
  findEdges = findActivitiesConnectionEdges,
  className = "border-t border-gray-300 dark:border-gray-700",
}) {
  const [first, setFirst] = useState(10);

  const { data, loading, fetchMore } = useQuery(query, {
    variables: { ...variables, first },
  });

  if (!eachActivity) {
    eachActivity = ({ activity, index }) => (
      <ConversationFeedItem
        project={project}
        key={activity.id}
        index={index}
        activity={activity}
        handlers={handlers}
        minimal={minimal}
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

  if (loading) {
    return (
      <div className="px-6">
        <Loader />
      </div>
    );
  }

  const [edges, pageInfo] = findEdges(data);

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
