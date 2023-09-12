import React, { useCallback } from "react";

import { Frame, saveLayout } from "src/components/widgets";
import SearchComponent from "src/components/domains/search/Search";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";

export default function Search({ project, api, containerApi, handlers }) {
  const initialTerm = api.title === "Search" ? "" : api.title;

  const updateTitle = useCallback(
    (appliedTerm) => {
      if (appliedTerm) {
        api.setTitle(appliedTerm);
        saveLayout({ project, containerApi });
      }
    },
    [project, api, containerApi]
  );

  const onChange = useCallback(
    (appliedTerm) => {
      updateTitle(appliedTerm || "Search");
    },
    [updateTitle]
  );

  const renderResults = ({ conversations, appliedTerm }) => {
    return (
      <div className="flex flex-col space-y-0">
        {conversations.map((conversation) => (
          <ConversationFeedItem
            key={conversation.id}
            conversation={conversation}
            project={project}
            handlers={handlers}
            term={appliedTerm}
          />
        ))}
      </div>
    );
  };

  return (
    <Frame>
      <div className="my-6">
        <SearchComponent
          initialTerm={initialTerm}
          project={project}
          renderResults={renderResults}
          onChange={onChange}
          distanceThreshold={0.5}
          immediatelyVisibleResults={10}
        ></SearchComponent>
      </div>
    </Frame>
  );
}
