import React, { useRef, useCallback, useState, useEffect } from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";
import {
  Frame,
  Scroll,
  Header,
  Activities,
  clickHandlers,
} from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c from "lib/common";

export default function Search(props) {
  var { initialTerm, project, community } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [term, setTerm] = useState(initialTerm);
  const [appliedTerm, setAppliedTerm] = useState(null);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    fetch(`/api/projects/${project.id}/search?q=${term}`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          alert(message);
        } else {
          setAppliedTerm(term);
          setData(result);
        }
        setLoading(false);
      });
  }, [term, project]);

  useEffect(() => {
    if (term) {
      fetchSearch();
    }
  }, []);

  // eventually map the activities back to their threads, dedup, add highlighting
  var activities = data
    .map((doc) => doc.metadata.activityId)
    .map((activityId) => community.findActivityById(activityId))
    .filter((a) => a);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    fetchSearch();
  };

  const onSearchChange = (e) => {
    setTerm(e.target.value);
  };

  var title = appliedTerm || "Search";

  return (
    <Frame>
      <Header {...props}>
        <FontAwesomeIcon icon="search" />
        <div>{title}</div>
        {activities.length > 0 && (
          <div className="text-indigo-500">{activities.length}</div>
        )}
        {loading && (
          <div className="font-normal text-indigo-600">Searching...</div>
        )}
      </Header>
      <Scroll>
        <div className="flex flex-col space-y-2">
          <form onSubmit={onSearchSubmit} className="flex px-4 mb-2 space-x-2">
            <input
              className={c.inputClasses}
              required
              type="search"
              value={term}
              onChange={onSearchChange}
            />
            <button type="submit" className={c.buttonClasses}>
              Submit
            </button>
          </form>
          {activities.map((activity, index) => (
            <div
              key={activity.id}
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
          ))}
        </div>
      </Scroll>
    </Frame>
  );
}
