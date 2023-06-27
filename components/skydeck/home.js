import React, { useState, useEffect, useCallback } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import c from "lib/common";

import Feed from "lib/community/feed";
import Stats from "lib/community/stats";
import Community from "lib/community";
import { Source, Entities, Members } from "components/skydeck";
import SourceIcon from "components/compact/source_icon";
import ActivitiesSlider from "components/activitiesSlider";

export default function Home(props) {
  let { project, community, setCommunity, levels, addWidget, resetWidgets } =
    props;

  const [loading, setLoading] = useState(null);
  const [stats, setStats] = useState(null);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);

  // the sequence is
  // stats component fetches stats
  // that updates the slider
  // the slider updates low/high which triggers a project fetch
  const fetchStats = useCallback(async () => {
    setLoading(true);
    return fetch(`/api/projects/${project.id}/stats`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          console.log("Error fetching stats", message);
        } else {
          var stats = new Stats({ result });
          setStats(stats);
        }
        setLoading(false);
      });
  }, [project.id, setStats]);

  const fetchProject = useCallback(
    async ({ low, high }) => {
      console.log(`Project fetch started low=${low} high=${high}`);

      var params = "";
      // if a stats are already loaded, we should use low and high to narrow the query
      if (stats && (low || high)) {
        const { minDate } = stats.getActivityDayRange();
        const from = c.addDays(minDate, low).toISOString();
        const to = c.addDays(minDate, high).toISOString();
        params = new URLSearchParams({
          from,
          to,
        });
      }

      // show loading always since it takes a while in prod right now
      setLoading(true);

      // send low and high
      fetch(`/api/projects/${project.id}?` + params)
        .then((res) => res.json())
        .then(({ result, message }) => {
          console.log("Project fetch: finished");
          if (message) {
            console.log("Error fetching project", message);
          } else {
            const newCommunity = new Community({ result, levels });
            setCommunity(newCommunity);
            setLoading(false);
          }
        });
    },
    [project.id, stats, setCommunity, levels]
  );

  // refetch when the slider changes
  const onSliderChange = async ({ low, high }) => {
    // if high is 0 it means we're still initiatlizing, so don't
    // do anything; onSliderChange will fire only the proper max value is
    // set due to the fetchStats call
    if (!community || high !== 0) {
      fetchProject({ low, high });
      setLow(low);
      setHigh(high);
    }
  };

  // do only on mount
  useEffect(() => {
    fetchStats();
  }, []);

  var sources = [];
  if (community) {
    var feed = new Feed(props);
    sources = feed.getSources({ activities: community.activities });
  }

  const empty = stats?.activities?.count === 0;

  return (
    <Frame>
      <Header {...props}>
        <div>{project.name}</div>
      </Header>
      <Scroll>
        <div className="flex flex-col px-4 w-[300px]">
          <div className="flex flex-col items-start space-y-1">
            <div className="relative pb-12 w-full">
              {stats && !empty && (
                <ActivitiesSlider
                  community={community}
                  low={low}
                  high={high}
                  stats={stats}
                  onSliderChange={onSliderChange}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col items-start space-y-1">
            <div className="text-lg font-semibold">Add Columns</div>
            <button
              className=""
              onClick={() => addWidget((props) => <Members {...props} />)}
            >
              Member List
            </button>
            <button
              className=""
              onClick={() => addWidget((props) => <Entities {...props} />)}
            >
              Entities
            </button>
            <button
              className=""
              onClick={() =>
                addWidget((props) => (
                  <Source source={null} title="All Activities" {...props} />
                ))
              }
            >
              All Activities
            </button>
            {sources.map((source) => (
              <button
                key={source}
                className="flex items-center space-x-1"
                onClick={() =>
                  addWidget((props) => (
                    <Source
                      source={source}
                      title={c.titleize(source)}
                      {...props}
                    />
                  ))
                }
              >
                <SourceIcon activity={{ source }} />
                <div>{c.titleize(source)}</div>
              </button>
            ))}
            <button className="text-red-500" onClick={resetWidgets}>
              Reset
            </button>
          </div>
          <div></div>
        </div>
      </Scroll>
    </Frame>
  );
}
