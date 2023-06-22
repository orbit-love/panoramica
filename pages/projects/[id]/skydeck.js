import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getServerSession } from "next-auth/next";

import c from "lib/common";
import { prisma } from "lib/db";
import Feed from "lib/community/feed";
import Community from "lib/community";
import levelsData from "data/levels";
import { authOptions } from "pages/api/auth/[...nextauth]";

import Head from "components/head";
import Header from "components/header";
import CompactMember from "components/compact/member";
import NameAndIcon from "components/compact/name_and_icon";
import SourceIcon from "components/compact/source_icon";
import ActivityOrThread from "components/compact/activity_or_thread";

function removeItem(array, item) {
  const index = array.indexOf(item);
  if (index !== -1) {
    let newArray = [...array]; // copy the array
    newArray.splice(index, 1); // remove the item
    return newArray;
  }
  return array; // return the original array if item was not found
}

const Activities = (props) => {
  var { community, source, title, remove } = props;
  var feed = new Feed(props);
  var activities = feed.getFilteredActivities();
  if (source) {
    activities = activities.filter(
      (activity) => !source || source === activity.source
    );
  }

  // for performance
  activities = activities.slice(0, 50);

  return (
    <div className="flex flex-col space-y-2 min-w-[200px] max-w-[450px] relative">
      <div className="flex items-baseline pt-2 px-4 space-x-1">
        <span className="flex-inline items-baseline space-x-2 text-lg font-semibold">
          <SourceIcon activity={{ source: source }} />
          <span>{title}</span>
        </span>
        <span className="text-md px-1 text-indigo-500">
          {activities.length}
        </span>
        <span className="!mx-auto" />
        <button className="absolute top-3 right-4 text-lg" onClick={remove}>
          <FontAwesomeIcon icon="xmark" />
        </button>
      </div>
      <div className="border-b border-indigo-900" />
      {activities.length > 0 && (
        <>
          {activities.map((activity, index) => (
            <ActivityOrThread
              key={activity.id}
              activity={activity}
              community={community}
              index={index}
              {...props}
            />
          ))}
        </>
      )}
    </div>
  );
};

const Member = (props) => {
  var { member, community, source, remove } = props;
  var feed = new Feed({ selection: member, ...props });
  var activities = feed.getFilteredActivities();
  if (source) {
    activities = activities.filter(
      (activity) => !source || source === activity.source
    );
  }

  return (
    <div className="flex flex-col space-y-2 min-w-[200px] max-w-[450px] relative">
      <div className="flex items-center pt-2 px-4 space-x-1">
        <div className="text-lg font-semibold">
          <NameAndIcon member={member} onClick={() => {}} />
        </div>
        <span className="text-md px-1 text-indigo-500">
          {activities.length}
        </span>
        <span className="!mx-auto" />
        <button className="absolute top-3 right-4 text-lg" onClick={remove}>
          <FontAwesomeIcon icon="xmark" />
        </button>
      </div>
      <div className="border-b border-indigo-900" />
      {activities.length > 0 && (
        <>
          {activities.map((activity, index) => (
            <ActivityOrThread
              key={activity.id}
              activity={activity}
              community={community}
              index={index}
              {...props}
            />
          ))}
        </>
      )}
    </div>
  );
};

const MemberList = (props) => {
  let { community, widgets, setWidgets, remove } = props;
  let { members } = community;
  let onClickFor = (member) => {
    return () => {
      setWidgets([
        ...widgets.slice(0, 1),
        (props) => (
          <Member
            key={member.globalActor}
            title={member.globalActorName}
            member={member}
            {...props}
          />
        ),
        ...widgets.slice(1, widgets.length),
      ]);
    };
  };
  return (
    <div className="flex relative flex-col py-2 px-4 space-y-2 text-ellipsis">
      <div className="flex items-baseline space-x-1">
        <span className="text-lg font-semibold">Members</span>
        <span className="text-md px-1 text-indigo-500">{members.length}</span>
        <span className="!mx-auto" />
        <button className="absolute top-3 right-4 text-lg" onClick={remove}>
          <FontAwesomeIcon icon="xmark" />
        </button>
      </div>
      <div className="border-b border-indigo-900" />
      <div className="flex flex-col">
        {[1, 2, 3, 4].map((number) => (
          <div key={number} className="flex flex-col max-w-[400px]">
            {members
              .filter((member) => member.level === number)
              .map((member) => (
                <CompactMember
                  key={member.globalActor}
                  member={member}
                  community={community}
                  metrics={true}
                  onClick={onClickFor(member)}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Page({ _project }) {
  const containerRef = useRef();
  const [project, _] = useState(_project);

  const [__, setLoading] = useState(false);
  const [community, setCommunity] = useState(null);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [widgets, setWidgets] = useState([]);

  // transform levels into a map
  const levels = {};
  levelsData.forEach((levelData) => {
    levels[levelData.number] = {
      ...levelData,
    };
  });

  const props = {
    project: _project,
    community,
    setCommunity,
    low,
    setLow,
    high,
    setHigh,
    levels,
    widgets,
    setWidgets,
  };

  let Discord = (props) => (
    <Activities source="discord" title="Discord" {...props} />
  );
  let GitHub = (props) => (
    <Activities source="github" title="GitHub" {...props} />
  );
  let Twitter = (props) => (
    <Activities source="twitter" title="Twitter" {...props} />
  );
  let Members = (props) => <MemberList {...props} />;

  useEffect(() => {
    if (widgets.length === 0) {
      setLoading(true);
      fetch(`/api/projects/${project.id}?`)
        .then((res) => res.json())
        .then(({ result, message }) => {
          console.log("Project fetch: finished");
          if (message) {
            console.log("Error fetching project", message);
          } else {
            const newCommunity = new Community({ result, levels });
            setCommunity(newCommunity);
            setLoading(false);
            setWidgets([Members, Discord, GitHub, Twitter]);
          }
        });
    }
  }, []);

  const classes = `flex overflow-y-scroll overflow-x-hidden space-x-3 rounded-lg text-[${c.whiteColor}] bg-indigo-800 border border-indigo-800 bg-opacity-30`;

  return (
    <>
      <Head />
      <div className="space-gradient text-indigo-500 w-[200vw]">
        <div className="flex pt-2 px-4 text-3xl font-thin">
          <span className="opacity-90 px-[3px]">s</span>
          <span className="opacity-80 px-[3px]">k</span>
          <span className="opacity-80 px-[3px]">y</span>
          <span className="opacity-70 px-[3px]">d</span>
          <span className="opacity-60 px-[3px]">e</span>
          <span className="opacity-50 px-[3px]">c</span>
          <span className="opacity-40 px-[3px]">k</span>
        </div>
      </div>
      <div
        ref={containerRef}
        id="container"
        className="space-gradient flex relative px-4 pt-4 space-x-4"
        style={{
          width: "200vw",
          height: "100vh",
        }}
      >
        {widgets.map((Widget) => (
          <div key={Widget} className={classes}>
            <Widget
              {...props}
              remove={() => setWidgets(removeItem(widgets, Widget))}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  var _project = null;
  if (session?.user) {
    const { id } = context.query;
    const user = session.user;
    // check if the user has access
    let where = { id };
    if (!user.admin) {
      where.user = {
        email: user.email,
      };
    }
    _project = await prisma.project.findFirst({
      where,
    });
  }
  if (_project) {
    return {
      props: {
        session,
        _project,
      },
    };
  } else {
    return {
      redirect: { destination: "/" },
    };
  }
}
