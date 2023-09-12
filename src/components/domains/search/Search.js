import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Loader from "src/components/domains/ui/Loader";
import SearchConversationsQuery from "./SearchConversations.gql";
import GetConversationsByIdsQuery from "src/graphql/queries/GetConversationsByIds.gql";

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
  const [conversations, setConversations] = useState([]);
  const [numberOfHiddenConversations, setNumberOfHiddenConversations] =
    useState(0);

  const { id: projectId } = project;

  const [getConversationsByIds] = useLazyQuery(GetConversationsByIdsQuery, {
    variables: { projectId, ids: [] },
    onCompleted: (data) => {
      const {
        projects: [{ conversations }],
      } = data;
      setConversations(conversations);
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

        // filter out conversations that aren't likely to be good results
        var filteredConversations = searchConversations;
        if (!seeAll) {
          filteredConversations =
            searchConversations
              ?.filter(({ distance }) => distance <= distanceThreshold)
              ?.slice(0, immediatelyVisibleResults) || [];
        }

        const numberOfHiddenConversations =
          searchConversations.length - filteredConversations.length;
        setNumberOfHiddenConversations(numberOfHiddenConversations);

        var ids = filteredConversations.map(({ id }) => id);
        await getConversationsByIds({ variables: { ids } });
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
    if (appliedTerm && conversations.length === 0) {
      searchConversationsQuery({ variables: { query: appliedTerm } });
    }
  }, [appliedTerm, conversations, searchConversationsQuery]);

  const onSearchChange = (e) => {
    setTerm(e.target.value);
  };

  const onReset = () => {
    setTerm("");
    setAppliedTerm("");
    setConversations([]);
    setSeeAll(false);
    setNumberOfHiddenConversations(0);
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
        {conversations.length > 0 && (
          <button
            onClick={onReset}
            type="button"
            className="btn !bg-gray-400 dark:!bg-gray-700"
          >
            <FontAwesomeIcon icon="xmark" />
          </button>
        )}
      </form>
      {conversations.length > 0 &&
        renderResults({ conversations, appliedTerm })}
      {!seeAll &&
        conversations.length > 0 &&
        numberOfHiddenConversations > 0 && (
          <div className="p-6">
            <button
              className="text-tertiary hover:underline"
              title="See potentially less relevant results"
              onClick={() => setSeeAll(true)}
            >
              See {numberOfHiddenConversations} results with lower relevance
            </button>
          </div>
        )}
    </>
  );
}
