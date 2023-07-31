import React, { useState, useEffect } from "react";

import { Frame } from "src/components/widgets";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import Loader from "src/components/domains/ui/Loader";
import { getSimilarConversations } from "src/data/client/fetches";

export default function Similar({ project, community, params, api, handlers }) {
  var { activityId } = params;
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState({ result: [] });

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

  var activities = docs.result
    .map(({ id }) => community.findActivityById(id))
    .filter((activity) => activity);

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
    </Frame>
  );
}
