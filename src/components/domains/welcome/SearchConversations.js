import React from "react";
import ActivityItem from "src/components/domains/welcome/ActivityItem";
import Search from "src/components/domains/search/Search";

export default function SearchConversations({ project, handlers }) {
  const renderResults = ({ activities, appliedTerm }) => {
    return (
      <div className="flex flex-col px-6 space-y-6">
        {activities.map((activity) => (
          <ActivityItem
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
    <Search
      project={project}
      renderResults={renderResults}
      distanceThreshold={0.25}
      immediatelyVisibleResults={5}
    ></Search>
  );
}
