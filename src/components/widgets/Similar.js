import React from "react";
import { Frame } from "src/components/widgets";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";
import SimilarConversations from "src/components/domains/search/SimilarConversations";

export default function Similar({ project, params, handlers }) {
  const { activity } = params;

  const renderResults = ({ activities }) => {
    return (
      <div className="flex flex-col space-y-0">
        {activities.map((activity) => (
          <ConversationFeedItem
            key={activity.id}
            activity={activity}
            project={project}
            handlers={handlers}
          />
        ))}
      </div>
    );
  };

  const summary = activity.summary || activity.text.slice(0, 50);

  return (
    <Frame>
      <div className="pt-4 px-6">
        <span className="text-tertiary font-light">Similar to:</span>{" "}
        <span className="font-semibold">{summary}</span>
      </div>
      <React.Suspense fallback={<div className="p-6">Loading...</div>}>
        <SimilarConversations
          project={project}
          activity={activity}
          renderResults={renderResults}
        />
      </React.Suspense>
    </Frame>
  );
}
