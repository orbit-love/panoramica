import React, { useState, useRef, useCallback, useEffect } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import Activity from "components/compact/activity";
import c from "lib/common";

export default function Chat(props) {
  let searchRef = useRef();

  let { project, community } = props;
  let [loading, setLoading] = useState(false);
  let [query, setQuery] = useState(true);
  let [data, setData] = useState(null);

  const fetchQuery = useCallback(async () => {
    setLoading(true);
    fetch(`/api/projects/${project.id}/query?q=${query}`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        console.log("Project fetch: finished");
        if (message) {
          alert(message);
        } else {
          setData(result);
          setLoading(false);
        }
      });
  }, [project, query, setData, setLoading]);

  const find = (id) => community.activities.find((a) => a.id === id);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    var query = searchRef.current.value;
    setQuery(query);
    fetchQuery();
  };

  return (
    <Frame>
      <Header {...props}>
        <div className="text-lg">Chat</div>
      </Header>
      <Scroll>
        <div className="flex flex-col px-4">
          <div className="mb-4 font-semibold text-center text-blue-500">
            <form onSubmit={onSearchSubmit} className="flex space-x-2">
              <input className={c.inputClasses} type="search" ref={searchRef} />
              <button type="submit" className={c.buttonClasses}>
                Submit
              </button>
            </form>
          </div>
          {loading && <div className="text-indigo-600">Loading...</div>}
          {!loading && data && (
            <div className="font-mono text-sm">{data.text}</div>
          )}
        </div>
      </Scroll>
    </Frame>
  );
}
