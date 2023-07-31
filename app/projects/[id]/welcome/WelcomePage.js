"use client";

import React, { useState, useCallback, useRef } from "react";
import SiteHeader from "src/components/ui/SiteHeader";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "src/components/domains/ui/Loader";

import { ProjectContext } from "src/components/context/ProjectContext";
import Community from "src/models/Community";
import Paginator from "src/components/domains/feed/Paginator";

import Themed from "src/components/context/Themed";
import ActivityItem from "src/components/domains/public/ActivityItem";

const ConversationFeed = ({ project, activities, community, term }) => {
  const onClickTimestamp = (activity) =>
    `/projects/${project.id}/${activity.conversationId}`;
  const handlers = {
    onCLickMember: () => {},
    onClickChannel: () => {},
    onClickTimestamp,
  };

  return (
    <Paginator
      activities={activities}
      community={community}
      eachActivity={({ activity, index }) => (
        <ActivityItem
          project={project}
          key={activity.id}
          index={index}
          activity={activity}
          community={community}
          handlers={handlers}
          term={term}
        />
      )}
    />
  );
};

const RecentConversations = (props) => {
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
};

const SearchConversations = (props) => {
  const { community, project } = props;
  var searchRef = useRef();

  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState({ result: [] });
  const [term, setTerm] = useState("");
  const [seeAll, setSeeAll] = useState(false);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    setSeeAll(false);
    fetch(`/api/projects/${project.id}/search?q=${term}`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          alert(message);
        } else {
          setDocs({ result });
        }
        setLoading(false);
      });
  }, [term, project]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    fetchSearch();
  };

  const onSearchChange = (e) => {
    setTerm(e.target.value);
  };

  // filter out docs that aren't likely to be good results
  var scoreThreshold = 0.76;
  var activities = docs.result
    .filter(({ score }) => seeAll || score > scoreThreshold)
    .map(({ id }) => community.findActivityById(id));
  var numberOfActivitiesBelowThreshold = docs.result.length - activities.length;

  return (
    <div className="flex flex-col mt-6 space-y-2">
      <form onSubmit={onSearchSubmit} className="flex pb-4 px-6 space-x-2">
        <input
          ref={searchRef}
          required
          type="search"
          value={term}
          onChange={onSearchChange}
        />
        <button type="submit" className="btn">
          {loading && <Loader className="text-white" />}
          {!loading && <FontAwesomeIcon icon="search" />}
        </button>
      </form>
      {activities.length > 0 && (
        <ConversationFeed {...props} term={term} activities={activities} />
      )}
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
    </div>
  );
};

export default function WelcomePage({ project, data }) {
  const community = new Community({ result: data });
  const object = { project, community };

  return (
    <Themed>
      <ProjectContext.Provider value={object}>
        <SiteHeader hideLogo />
        <div className="flex-col py-8 space-y-6 h-full sm:flex-row sm:px-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="text-3xl font-bold">{project.name}</div>
            <div className="text-tertiary font-light">
              Search & Browse Conversations
            </div>
          </div>
          <div className="flex-col space-y-9 sm:flex sm:flex-row sm:space-y-0 sm:space-x-6">
            <div className="flex flex-col h-[calc(100vh-160px)] space-y-4 sm:w-1/2 w-full overflow-x-hidden">
              <div className="text-tertiary px-6 text-center">
                Recent Conversations
              </div>
              <div className="sm:dark:border-gray-700 flex overflow-y-scroll flex-col h-full sm:border sm:border-gray-200">
                <RecentConversations project={project} community={community} />
              </div>
            </div>
            <div className="flex flex-col h-[calc(100vh-160px)] sm:space-y-4 sm:w-1/2 w-full overflow-x-hidden">
              <div className="text-tertiary px-6 text-center">
                Search Conversations
              </div>
              <div className="sm:dark:border-gray-700 flex overflow-y-scroll flex-col h-full sm:border sm:border-gray-200">
                <SearchConversations project={project} community={community} />
              </div>
            </div>
          </div>
        </div>
      </ProjectContext.Provider>
    </Themed>
  );
}
