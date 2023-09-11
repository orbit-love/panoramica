import React from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import ConversationItem from "./ConversationItem";
import GetConversationsQuery from "src/graphql/queries/GetConversations.gql";

export default function TableBody({
  projectId,
  where,
  limit,
  offset,
  conversations,
  setConversations,
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
        projects: [{ conversations }],
      } = data;
      setConversations(conversations);
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
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          setConversations={setConversations}
          setRefetchNow={setRefetchNow}
          {...props}
        />
      ))}
      <tr className="h-full"></tr>
    </tbody>
  );
}
