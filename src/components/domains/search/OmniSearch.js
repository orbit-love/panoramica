import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Loader from "src/components/domains/ui/Loader";
import OmniSearchQuery from "./OmniSearch.gql";
import GetActivitiesByIdsQuery from "./GetActivitiesByIds.gql";
import ActivityItem from "../welcome/ActivityItem";

export default function OmniSearch({
  project,
  initialTerm,
  handlers,
  onChange,
}) {
  var searchRef = useRef();

  const [term, setTerm] = useState(initialTerm || "");
  const [appliedTerm, setAppliedTerm] = useState(initialTerm);
  const [activities, setActivities] = useState([]);
  const [qas, setQas] = useState([]);

  const noResult = activities.length === 0 && qas.length === 0;

  const { id: projectId } = project;

  const [getActivitiesByIds] = useLazyQuery(GetActivitiesByIdsQuery, {
    variables: { projectId, ids: [] },
    onCompleted: (data) => {
      const {
        projects: [{ activities }],
      } = data;

      const updatedActivities = activities.map((activity) => {
        return {
          ...activity,
          conversation: {
            ...activity.conversation.descendants[0],
            ...activity.conversation,
          },
        };
      });
      setActivities(updatedActivities);
    },
  });

  const [omniSearchQuery, { loading }] = useLazyQuery(OmniSearchQuery, {
    variables: { projectId, query: "" },
    onCompleted: async (data) => {
      const {
        projects: [
          {
            omniSearch: { conversationSearchResults, qaSearchResults },
          },
        ],
      } = data;

      var ids = conversationSearchResults.map(({ id }) => id);
      await getActivitiesByIds({ variables: { ids } });
      setQas(qaSearchResults);
    },
  });

  const onSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setAppliedTerm(term);
      omniSearchQuery({ variables: { query: term } });
    },
    [term, omniSearchQuery]
  );

  useEffect(() => {
    if (appliedTerm && noResult) {
      omniSearchQuery({ variables: { query: appliedTerm } });
    }
  }, [appliedTerm, noResult, omniSearchQuery]);

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
    setActivities([]);
    setQas([]);
  };

  return (
    <>
      <form
        onSubmit={onSearchSubmit}
        className="flex pb-4 px-12 space-x-1 w-full"
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

      <div className="flex pb-4 px-6 space-x-1 w-full">
        <div>
          {activities.length > 0 && (
            <div className="flex flex-col px-6 space-y-6">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  project={project}
                  handlers={handlers}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          {qas.length > 0 && (
            <div className="flex flex-col space-y-6">
              {qas.map((qa) => (
                <div key={qa.id}>
                  <h4 className="font-semibold text-lg">{qa.question}</h4>
                  <p>{qa.answer}</p>
                  {qa.pageUrl && (
                    <p>
                      Source:{" "}
                      <a className="font-light underline" href={qa.pageUrl}>
                        {qa.pageTitle || qa.pageUrl}
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
