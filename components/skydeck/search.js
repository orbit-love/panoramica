import React, { useRef, useCallback, useState, useEffect } from "react";

import Activities from "components/compact/activities";
import { Frame, Scroll, Header } from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c from "lib/common";

export default function Search({ project, community, api, params, handlers }) {
  var searchRef = useRef();
  var { initialTerm } = params;

  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [term, setTerm] = useState(initialTerm);
  const [appliedTerm, setAppliedTerm] = useState(null);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    api.setTitle(term + "...");
    fetch(`/api/projects/${project.id}/search?q=${term}`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          alert(message);
        } else {
          setAppliedTerm(term);
          api.setTitle(term);
          setDocs(result);
        }
        setLoading(false);
      });
  }, [api, term, project]);

  useEffect(() => {
    searchRef.current.focus();
    if (term) {
      fetchSearch();
    }
  }, []);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    fetchSearch();
  };

  const onSearchChange = (e) => {
    setTerm(e.target.value);
  };

  var activities = docs.map(({ metadata: { activityId, conversationId } }) => {
    var activity = community.findActivityById(activityId);
    activity.conversationId = conversationId;
    return activity;
  });

  var onClickActivity = (e, activity) => {
    var conversation = community.findActivityById(activity.conversationId);
    handlers.onClickActivity(e, conversation);
  };

  return (
    <Frame api={api}>
      <div className="flex flex-col mt-6 space-y-2">
        <form onSubmit={onSearchSubmit} className="flex px-4 mb-2 space-x-2">
          <input
            ref={searchRef}
            className={c.inputClasses}
            required
            type="search"
            value={term}
            onChange={onSearchChange}
          />
          <button type="submit" className={c.buttonClasses}>
            {loading && <FontAwesomeIcon icon="circle-notch" spin />}
            {!loading && <FontAwesomeIcon icon="search" />}
          </button>
        </form>
        <Scroll>
          <Activities
            activities={activities}
            community={community}
            term={appliedTerm}
            handlers={{ ...handlers, onClickActivity }}
            maxDepth={0}
            hideNoActivities
          />
        </Scroll>
      </div>
    </Frame>
  );
}
