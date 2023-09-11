import React from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import ConversationItem from "./ConversationItem";
import GetConversationsQuery from "src/graphql/queries/GetConversations.gql";

export default function TableBody({
  projectId,
  where,
  limit,
  offset,
  activities,
  setActivities,
  setLoading,
  sort,
  trigger,
  refetchNow,
  setRefetchNow,
  ...props
}) {
  const { loading: queryLoading, refetch } = useQuery(GetConversationsQuery, {
    notifyOnNetworkStatusChange: true, // so that loading is true on refetch
    variables: {
      projectId,
      where,
      sort,
      limit,
      offset,
    },
    onCompleted: (data) => {
      const {
        projects: [{ activities }],
      } = data;
      setActivities(activities);
    },
  });

  React.useEffect(() => {
    if (refetchNow) {
      refetch();
    }
  }, [refetchNow, refetch]);

  React.useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);

  return (
    <tbody className="h-[70vh] overflow-y-auto">
      {activities.map((activity) => (
        <ConversationItem
          key={activity.id}
          activity={activity}
          setActivities={setActivities}
          setRefetchNow={setRefetchNow}
          {...props}
        />
      ))}
    </tbody>
  );
}
