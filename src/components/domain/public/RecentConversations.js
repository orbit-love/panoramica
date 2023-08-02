import React from "react";
import ConversationFeed from "src/components/domain/public/ConversationFeed";

export default function RecentConversations(props) {
  const { community } = props;

  const conversationIds = community.activities.map((a) => a.conversationId);
  var activities = community.activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversationId) === index;
  });

  // filter out conversations with no replies
  activities = activities.filter((activity) => {
    const conversationActivity = community.findActivityById(
      activity.conversationId
    );
    const conversation = community.conversations[conversationActivity.id];
    return conversation?.children?.length > 0;
  });

  return <ConversationFeed {...props} activities={activities} />;
}
