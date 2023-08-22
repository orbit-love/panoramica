import React from "react";
import { redirect } from "next/navigation";
import { getWelcomeClient as getClient } from "src/graphql/apollo-client";
import ConversationPage from "app/projects/[id]/welcome/[activityId]/ConversationPage";
import GetConversationQuery from "./GetConversation.gql";

export async function generateMetadata({ params }) {
  const { id: projectId, activityId } = params;
  const activity = await getConversation({ projectId, activityId });
  if (activity) {
    const titleProperty = activity.properties?.find(
      (property) => property.name === "title"
    );
    const title = titleProperty?.value || activity.text.slice(0, 100);
    return {
      title,
    };
  }
}

export default async function Page({ params }) {
  const { id: projectId, activityId } = params;
  const activity = await getConversation({ projectId, activityId });
  if (!activity) {
    redirect("/");
  }
  return <ConversationPage activity={activity} />;
}

const getConversation = async ({ projectId, activityId }) => {
  const {
    data: {
      projects: [
        {
          activities: [activity],
        },
      ],
    },
  } = await getClient().query({
    query: GetConversationQuery,
    variables: {
      activityId,
      projectId,
    },
  });
  return activity;
};
