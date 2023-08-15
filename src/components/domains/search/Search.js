import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Loader from "src/components/domains/ui/Loader";
import SearchConversationsQuery from "./SearchConversations.gql";
import GetActivitiesByIdsQuery from "./GetActivitiesByIds.gql";

export default function Search({
  project,
  initialTerm,
  renderResults,
  onChange,
  scoreThreshold,
  immediatelyVisibleResults,
}) {
  const { id: projectId } = project;
  var searchRef = useRef();

  const [term, setTerm] = useState(initialTerm || "");
  const [appliedTerm, setAppliedTerm] = useState(initialTerm);
  const [seeAll, setSeeAll] = useState(false);

  const { data, refetch } = useSuspenseQuery(SearchConversationsQuery, {
    variables: { projectId, query: appliedTerm || "do-not-search" },
  });
  const searchConversations = data?.projects[0].searchConversations || [];

  // filter out activities that aren't likely to be good results
  var filteredConversations = searchConversations;

  if (!seeAll) {
    filteredConversations =
      searchConversations
        ?.filter(({ score }) => score > scoreThreshold)
        ?.slice(0, immediatelyVisibleResults) || [];
  }

  var ids = filteredConversations.map(({ id }) => id);

  const { data: idsQueryData } = useSuspenseQuery(GetActivitiesByIdsQuery, {
    variables: { projectId, ids },
  });

  const activities = idsQueryData?.projects[0].activities || [];

  const numberOfActivitiesBelowThreshold =
    searchConversations.length - filteredConversations.length;

  const onSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setAppliedTerm(term);
      refetch();
    },
    [term, refetch]
  );

  useEffect(() => {
    if (onChange) {
      onChange(appliedTerm);
    }
  }, [appliedTerm, onChange]);

  const onSearchChange = (e) => {
    setTerm(e.target.value);
  };

  const onReset = () => {
    setTerm("");
    setAppliedTerm("");
    setSeeAll(false);
  };

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
        <button type="submit" className="btn">
          <React.Suspense fallback={<Loader className="text-white" />}>
            <FontAwesomeIcon className="text-white" icon="search" />
          </React.Suspense>
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
      {activities.length > 0 && renderResults({ activities, appliedTerm })}
      {!seeAll && numberOfActivitiesBelowThreshold > 0 && (
        <div className="p-6">
          <button
            className="text-tertiary hover:underline"
            title="See potentially less relevant results"
            onClick={() => setSeeAll(true)}
          >
            See {numberOfActivitiesBelowThreshold} results with lower relevance
          </button>
        </div>
      )}
    </>
  );
}
