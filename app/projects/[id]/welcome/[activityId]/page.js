import React from "react";
import { redirect } from "next/navigation";
import { getClient } from "src/graphql/apollo-client";
import ConversationPage from "app/projects/[id]/welcome/[activityId]/ConversationPage";
import GetConversationQuery from "./GetConversation.gql";

export async function generateMetadata({ params }) {
  const { activityId } = params;
  const activity = await getConversation({ id: activityId });
  if (activity) {
    const title = activity.summary || activity.text.slice(0, 50);
    return {
      title,
    };
  }
}

export default async function Page({ params }) {
  const { activityId } = params;
  const activity = await getConversation({ id: activityId });
  if (!activity) {
    redirect("/");
  }
  return <ConversationPage activity={activity} />;
}

const getConversation = async ({ id }) => {
  const {
    data: {
      activities: [activity],
    },
  } = await getClient().query({
    query: GetConversationQuery,
    variables: {
      id,
    },
  });
  return activity;
};
