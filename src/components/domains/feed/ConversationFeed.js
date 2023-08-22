import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

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
  minimal,
  term,
  eachActivity,
  findEdges = findActivitiesConnectionEdges,
  className = "border-t border-gray-300 dark:border-gray-700",
}) {
  const [first, setFirst] = useState(10);
  const [activities, setActivities] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const { fetchMore } = useQuery(query, {
    variables: { ...variables, first },
    onCompleted: (data) => {
      const [edges, pageInfo] = findEdges(data);
      setActivities(edges.map((edge) => edge.node));
      setPageInfo(pageInfo);
      setLoading(false);
    },
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
    setLoading(true);
    fetchMore({
      variables: {
        first,
      },
    });
  }, [first, fetchMore]);

  // keep only the first activity in a conversation
  const conversationIds = activities.map((a) => a.conversation.id);
  const filteredActivities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversation.id) === index;
  });

  return (
    <div className={className}>
      <Paginator
        activities={filteredActivities}
        setFirst={setFirst}
        pageInfo={pageInfo}
        eachActivity={eachActivity}
        loading={loading}
      />
    </div>
  );
}
