import React, { useRef, useCallback, useState, useEffect } from "react";

import Activities from "components/compact/activities";
import { Frame, Scroll, Header } from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c from "lib/common";

export default function Search(props) {
  var { initialTerm, project, community } = props;
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [term, setTerm] = useState(initialTerm);
  const [appliedTerm, setAppliedTerm] = useState(null);
  var searchRef = useRef();

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    fetch(`/api/projects/${project.id}/search?q=${term}`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          alert(message);
        } else {
          setAppliedTerm(term);
          setDocs(result);
        }
        setLoading(false);
      });
  }, [term, project]);

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

  var title = appliedTerm || "Search";

  var activities = docs.map(({ metadata: { activityId, conversationId } }) => {
    var activity = community.findActivityById(activityId);
    activity.conversationId = conversationId;
    return activity;
  });

  var onClickActivity = (e, activity) => {
    var conversation = community.findActivityById(activity.conversationId);
    props.onClickActivity(e, conversation);
  };

  return (
    <Frame>
      <Header {...props}>
        <FontAwesomeIcon icon="search" />
        <div>{title}</div>
        {docs.length > 0 && (
          <div className="text-indigo-500">{docs.length}</div>
        )}
        {loading && (
          <div className="font-normal text-indigo-600">
            <FontAwesomeIcon icon="circle-notch" spin />
          </div>
        )}
      </Header>
      <Scroll>
        <div className="flex flex-col space-y-2 w-[450px]">
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
              <FontAwesomeIcon icon="search" />
            </button>
          </form>
          <Activities
            activities={activities}
            term={appliedTerm}
            {...props}
            onClickActivity={onClickActivity}
            maxDepth={0}
          />
        </div>
      </Scroll>
    </Frame>
  );
}
