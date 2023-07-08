import React, { useState, useCallback, useEffect } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import Activity from "components/compact/activity";

export default function Insights(props) {
  let { addWidget, project, community } = props;
  let [loading, setLoading] = useState(true);
  let [data, setData] = useState({});

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    fetch(`/api/projects/${project.id}/insights`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        console.log("Project fetch: finished");
        if (message) {
          alert(message);
        } else {
          setData(result);
        }
      });
  }, [project, setData, setLoading]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const find = (id) => community.activities.find((a) => a.id === id);

  return (
    <Frame api={api}>
      <Header {...props}>
        <div className="text-lg">Insights</div>
      </Header>
      <Scroll>
        <div className="flex flex-col px-4">
          <div className="mb-4 font-semibold text-blue-500 text-center">
            Longest Reply Delays
          </div>
          {data.highestDelays?.map(({ parent, child, responseTime }) => (
            <div key={responseTime} className="mb-2">
              <div className="text-blue-500 text-center">
                {Math.floor(responseTime / (1000 * 60 * 60 * 24))} days
              </div>
              <Activity activity={find(parent)} showSourceIcon {...props} />
              <Activity activity={find(child)} showSourceIcon {...props} />
            </div>
          ))}
          <div className="mt-4 text-center font-semibold text-blue-500">
            Shortest Reply Delays
          </div>
          {data.lowestDelays?.map(({ parent, child, responseTime }) => (
            <div key={responseTime} className="mb-2">
              <div className="text-blue-500 text-center">
                {Math.floor(responseTime / 1000)} seconds
              </div>
              <Activity activity={find(parent)} showSourceIcon {...props} />
              <Activity activity={find(child)} showSourceIcon {...props} />
            </div>
          ))}
        </div>
      </Scroll>
    </Frame>
  );
}
