import React, { useState, useEffect } from "react";

import { Frame } from "src/components/widgets";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import Loader from "src/components/domains/ui/Loader";
import { getSimilarConversations } from "src/data/client/fetches";

export default function Similar({ project, community, params, handlers }) {
  var { activityId } = params;
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState({ result: [] });
  const [seeAll, setSeeAll] = useState(false);

  useEffect(() => {
    getSimilarConversations({
      project,
      activityId,
      onSuccess: setDocs,
      setLoading,
    });
  }, []);

  var activity = community.findActivityById(activityId);
  var summary = activity.summary || activity.text.slice(0, 50);

  // filter out docs that aren't likely to be good results
  // this threshold is higher than individual activities because
  // more text means higher likelihood of higher scores
  var scoreThreshold = 0.81;
  var activities = docs.result
    .filter(({ score }) => seeAll || score > scoreThreshold)
    .map(({ id }) => community.findActivityById(id));
  var numberOfActivitiesBelowThreshold = docs.result.length - activities.length;

  return (
    <Frame>
      <div className="py-4 px-6">
        <span className="text-tertiary font-light">Similar to:</span>{" "}
        <span className="font-semibold">{summary}</span>
      </div>
      {loading && (
        <div className="px-6 pb-6">
          <Loader />
        </div>
      )}
      <ConversationFeed
        project={project}
        activities={activities}
        community={community}
        handlers={handlers}
      />
      {!seeAll && numberOfActivitiesBelowThreshold > 0 && (
        <div className="p-6">
          <button
            className="text-tertiary hover:underline"
            title="See potentially less relevant results"
            onClick={() => setSeeAll(true)}
          >
            See {numberOfActivitiesBelowThreshold} more with lower relevance
          </button>
        </div>
      )}
    </Frame>
  );
}
