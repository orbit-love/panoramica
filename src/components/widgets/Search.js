import React, { useRef, useCallback, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import { Frame, saveLayout } from "src/components/widgets";
import Loader from "../domains/ui/Loader";

export default function Search({
  project,
  community,
  api,
  containerApi,
  handlers,
}) {
  var searchRef = useRef();
  const initialTerm = api.title === "Search" ? "" : api.title;

  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [term, setTerm] = useState(initialTerm); // tracks the input box
  const [appliedTerm, setAppliedTerm] = useState(initialTerm);

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
      if (appliedTerm) {
        api.setTitle(appliedTerm);
        saveLayout({ project, containerApi });
      }
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

  var activities = docs
    .map(({ conversationId }) => community.findActivityById(conversationId))
    .filter((activity) => activity);

  return (
    <Frame>
      <div className="flex flex-col px-6 mt-6 space-y-2">
        <form onSubmit={onSearchSubmit} className="flex pb-4 space-x-2">
          <input
            ref={searchRef}
            required
            type="search"
            value={term}
            onChange={onSearchChange}
          />
          <button type="submit" className="btn">
            {loading && <Loader />}
            {!loading && <FontAwesomeIcon icon="search" />}
          </button>
        </form>
        <ConversationFeed
          project={project}
          activities={activities}
          community={community}
          term={appliedTerm}
          handlers={handlers}
        />
      </div>
    </Frame>
  );
}
