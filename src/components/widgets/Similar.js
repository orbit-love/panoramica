import React from "react";
import { Frame } from "src/components/widgets";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";
import SimilarConversations from "src/components/domains/search/SimilarConversations";
import Loader from "../domains/ui/Loader";

export default function Similar({ project, api, params, handlers }) {
  const { conversation } = params;

  const renderResults = ({ conversations }) => {
    return (
      <div className="flex flex-col space-y-0">
        {conversations.map((conversation) => (
          <ConversationFeedItem
            key={conversation.id}
            conversation={conversation}
            project={project}
            handlers={handlers}
          />
        ))}
      </div>
    );
  };

  return (
    <Frame>
      <div className="pt-4 px-6">
        <span className="text-tertiary font-light">Similar to:</span>{" "}
        <span className="font-semibold">{api.title}</span>
      </div>
      <React.Suspense
        fallback={
          <div className="p-6">
            <Loader />
          </div>
        }
      >
        <SimilarConversations
          project={project}
          conversation={conversation}
          renderResults={renderResults}
        />
      </React.Suspense>
    </Frame>
  );
}
