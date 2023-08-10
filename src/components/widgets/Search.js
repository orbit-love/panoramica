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
      updateTitle(appliedTerm);
    },
    [updateTitle]
  );

  const renderResults = ({ activities, appliedTerm }) => {
    return (
      <div className="flex flex-col space-y-0">
        {activities.map((activity) => (
          <ConversationFeedItem
            key={activity.id}
            activity={activity}
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
          scoreThreshold={0.75}
          immediatelyVisibleResults={10}
        ></SearchComponent>
      </div>
    </Frame>
  );
}
