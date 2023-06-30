import React, { useState, useCallback, useEffect } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import Activity from "components/compact/activity";

export default function Insights(props) {
  let { addWidget, project, community } = props;
  let [loading, setLoading] = useState(true);
  let [data, setData] = useState(null);

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

  const activityMap = data?.insights?.map(({ parent, child, responseTime }) => {
    return {
      parent: community.activities.find((a) => a.id === parent),
      child: community.activities.find((a) => a.id === child),
      responseTime,
    };
  });

  return (
    <Frame>
      <Header {...props}>
        <div>Insights</div>
      </Header>
      <Scroll>
        <div className="flex flex-col px-4">
          <div className="mb-4 font-semibold">
            Longest Time Between Messages
          </div>
          {activityMap?.map(({ parent, child, responseTime }) => (
            <div key={responseTime} className="mb-8">
              <Activity activity={parent} {...props} />
              <Activity activity={child} {...props} />
            </div>
          ))}
        </div>
      </Scroll>
    </Frame>
  );
}
