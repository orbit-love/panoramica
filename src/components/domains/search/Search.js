import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Loader from "src/components/domains/ui/Loader";
import SearchConversationsQuery from "./SearchConversations.gql";
import GetActivitiesByIdsQuery from "./GetActivitiesByIds.gql";

export default function Search({
  project,
  initialTerm,
  renderResults,
  onChange,
  distanceThreshold,
  immediatelyVisibleResults,
}) {
  var searchRef = useRef();

  const [term, setTerm] = useState(initialTerm || "");
  const [appliedTerm, setAppliedTerm] = useState(initialTerm);
  const [seeAll, setSeeAll] = useState(false);
  const [activities, setActivities] = useState([]);
  const [numberOfHiddenActivities, setNumberOfHiddenActivities] = useState(0);

  const { id: projectId } = project;

  const [getActivitiesByIds] = useLazyQuery(GetActivitiesByIdsQuery, {
    variables: { projectId, ids: [] },
    onCompleted: (data) => {
      const {
        projects: [{ activities }],
      } = data;
      setActivities(activities);
    },
  });

  const [searchConversationsQuery, { loading }] = useLazyQuery(
    SearchConversationsQuery,
    {
      variables: { projectId, query: "" },
      onCompleted: async (data) => {
        const {
          projects: [{ searchConversations }],
        } = data;

        // filter out activities that aren't likely to be good results
        var filteredConversations = searchConversations;
        if (!seeAll) {
          filteredConversations =
            searchConversations
              ?.filter(({ distance }) => distance <= distanceThreshold)
              ?.slice(0, immediatelyVisibleResults) || [];
        }

        const numberOfHiddenActivities =
          searchConversations.length - filteredConversations.length;
        setNumberOfHiddenActivities(numberOfHiddenActivities);

        var ids = filteredConversations.map(({ id }) => id);
        await getActivitiesByIds({ variables: { ids } });
      },
    }
  );

  const onSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setAppliedTerm(term);
      searchConversationsQuery({ variables: { query: term } });
    },
    [term, searchConversationsQuery]
  );

  useEffect(() => {
    if (appliedTerm && activities.length === 0) {
      searchConversationsQuery({ variables: { query: appliedTerm } });
    }
  }, [appliedTerm, activities, searchConversationsQuery]);

  const onSearchChange = (e) => {
    setTerm(e.target.value);
  };

  const onReset = () => {
    setTerm("");
    setAppliedTerm("");
    setActivities([]);
    setSeeAll(false);
    setNumberOfHiddenActivities(0);
  };

  useEffect(() => {
    if (onChange) {
      onChange(appliedTerm);
    }
  }, [appliedTerm, onChange]);

  return (
    <>
      <form
        onSubmit={onSearchSubmit}
        className="flex pb-4 px-6 space-x-1 w-full"
      >
        <input
          ref={searchRef}
          required
          type="search"
          value={term}
          onChange={onSearchChange}
          className="!w-full"
        />
        <div />
        <button type="submit" className="btn">
          {loading && <Loader className="text-white" />}
          {!loading && <FontAwesomeIcon className="text-white" icon="search" />}
        </button>
        {activities.length > 0 && (
          <button
            onClick={onReset}
            type="button"
            className="btn !bg-gray-400 dark:!bg-gray-700"
          >
            <FontAwesomeIcon icon="xmark" />
          </button>
        )}
      </form>
      {activities.length > 0 && renderResults({ activities, appliedTerm })}
      {!seeAll && activities.length > 0 && numberOfHiddenActivities > 0 && (
        <div className="p-6">
          <button
            className="text-tertiary hover:underline"
            title="See potentially less relevant results"
            onClick={() => setSeeAll(true)}
          >
            See {numberOfHiddenActivities} results with lower relevance
          </button>
        </div>
      )}
    </>
  );
}
