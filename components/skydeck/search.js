import React, { useRef, useCallback, useState, useEffect } from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";
import { Frame, Scroll, Header, clickHandlers } from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c from "lib/common";

export default function Search(props) {
  var { initialTerm, project, community, onClickConversation } = props;
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

  const Doc = ({ metadata: { activityId, conversationId }, index }) => {
    var activity = community.findActivityById(activityId);
    var conversation = community.findActivityById(conversationId);
    return (
      <div
        key={activity.id}
        onClick={() => onClickConversation(conversation)}
        className={classnames("flex flex-col py-3 px-4", {
          "bg-blue-900": index % 2 === 1,
          "bg-opacity-20": index % 2 === 1,
        })}
      >
        <Activity
          key={activity.id}
          activity={activity}
          community={community}
          term={appliedTerm}
          {...clickHandlers}
          {...props}
        />
      </div>
    );
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
          <div className="font-normal text-indigo-600">Searching...</div>
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
          {docs.map((doc, index) => (
            <Doc key={index} {...doc} index={index} />
          ))}
        </div>
      </Scroll>
    </Frame>
  );
}
