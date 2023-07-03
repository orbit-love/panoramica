import React, { useRef, useCallback, useState, useEffect } from "react";

import { Frame, Scroll, Header, Activities } from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c from "lib/common";

export default function Search(props) {
  var { term, project, community } = props;
  let searchRef = useRef();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchSearch = useCallback(
    async (term) => {
      if (term) {
        setLoading(true);
        fetch(`/api/projects/${project.id}/search?q=${term}`)
          .then((res) => res.json())
          .then(({ result, message }) => {
            if (message) {
              alert(message);
            } else {
              setData(result);
            }
            setLoading(false);
          });
      }
    },
    [project]
  );

  useEffect(() => {
    if (term) {
      fetchSearch(term);
    }
  }, []);

  // eventually map the activities back to their threads, dedup, add highlighting
  var activities = data
    .map((doc) => doc.metadata.activityId)
    .map((activityId) => community.findActivityById(activityId))
    .filter((a) => a);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    var term = searchRef.current.value;
    fetchSearch(term);
  };

  var title = term || "Search";

  return (
    <Frame>
      <Header {...props}>
        <FontAwesomeIcon icon="search" />
        <div>{title}</div>
        <div className="text-indigo-500">{activities.length}</div>
        {loading && (
          <div className="font-normal text-indigo-600">Loading...</div>
        )}
      </Header>
      <Scroll>
        <div className="flex flex-col space-y-2">
          <form onSubmit={onSearchSubmit} className="flex px-4 mb-2 space-x-2">
            <input
              className={c.inputClasses}
              required
              type="search"
              ref={searchRef}
            />
            <button type="submit" className={c.buttonClasses}>
              Submit
            </button>
          </form>
          <Activities activities={activities} showReplies={true} {...props} />
        </div>
      </Scroll>
    </Frame>
  );
}
