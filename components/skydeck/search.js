import React, { useRef, useCallback, useState, useEffect } from "react";

import Activities from "components/compact/activities";
import { Frame, saveLayout } from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c from "lib/common";

export default function Search({
  project,
  community,
  api,
  containerApi,
  handlers,
}) {
  var searchRef = useRef();

  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [term, setTerm] = useState(api.title); // tracks the input box
  const [appliedTerm, setAppliedTerm] = useState(api.title);

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

  const updateTitle = useCallback(
    (appliedTerm) => {
      api.setTitle(appliedTerm);
      saveLayout({ project, containerApi });
    },
    [project, api, containerApi]
  );

  useEffect(() => {
    updateTitle(appliedTerm);
  }, [appliedTerm, updateTitle]);

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

  var activities = docs.map(({ metadata: { id } }) =>
    community.findActivityById(id)
  );

  var onClickActivity = (e, activity) => {
    var conversation = community.findActivityById(activity.conversationId);
    handlers.onClickActivity(e, conversation);
  };

  return (
    <Frame>
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
        <Activities
          activities={activities}
          community={community}
          term={appliedTerm}
          handlers={{ ...handlers, onClickActivity }}
          maxDepth={0}
        />
      </div>
    </Frame>
  );
}
