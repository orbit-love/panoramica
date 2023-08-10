import React, { useState, useCallback, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "src/components/domains/ui/Loader";
import ActivityItem from "src/components/domains/public/ActivityItem";

export default function SearchConversations({ project, handlers }) {
  var searchRef = useRef();

  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState({ result: [] });
  const [term, setTerm] = useState("");
  const [appliedTerm, setAppliedTerm] = useState("");
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
          setAppliedTerm(term);
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

  const onReset = () => {
    setTerm("");
    setAppliedTerm("");
    setDocs({ result: [] });
    setSeeAll(false);
  };

  return (
    <>
      <form
        onSubmit={onSearchSubmit}
        className="flex pb-4 px-6 space-x-1 w-full sm:px-0"
      >
        <input
          ref={searchRef}
          required
          type="search"
          value={term}
          onChange={onSearchChange}
          className="!w-full"
        />
        <div className="w-1"></div>
        <button type="submit" className="btn">
          {loading && <Loader className="text-white" />}
          {!loading && <FontAwesomeIcon icon="search" />}
        </button>
        {appliedTerm && (
          <button
            onClick={onReset}
            type="button"
            className="btn !bg-gray-400 dark:!bg-gray-700"
          >
            <FontAwesomeIcon icon="xmark" />
          </button>
        )}
      </form>
      {activities.length > 0 &&
        activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            project={project}
            handlers={handlers}
          />
        ))}
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
    </>
  );
}
