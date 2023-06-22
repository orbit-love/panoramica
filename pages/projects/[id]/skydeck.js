import React, { useEffect, useState, useRef } from "react";
import { getServerSession } from "next-auth/next";
import { prisma } from "lib/db";

import Community from "lib/community";
import levelsData from "data/levels";
import { authOptions } from "pages/api/auth/[...nextauth]";

import Head from "components/head";
import { Source, Members, Entities } from "components/skydeck";

function removeItem(array, item) {
  const index = array.indexOf(item);
  if (index !== -1) {
    let newArray = [...array]; // copy the array
    newArray.splice(index, 1); // remove the item
    return newArray;
  }
  return array; // return the original array if item was not found
}

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
    <Source source="discord" title="Discord" {...props} />
  );
  let GitHub = (props) => <Source source="github" title="GitHub" {...props} />;
  let Twitter = (props) => (
    <Source source="twitter" title="Twitter" {...props} />
  );
  let MembersWidget = (props) => <Members {...props} />;
  let EntitiesWidget = (props) => <Entities {...props} />;

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
            setWidgets([
              MembersWidget,
              EntitiesWidget,
              Discord,
              GitHub,
              Twitter,
            ]);
          }
        });
    }
  }, []);

  // var Logo = (
  //   <div className="flex px-2 text-3xl font-thin">
  //     <span className="opacity-90 px-[3px]">s</span>
  //     <span className="opacity-80 px-[3px]">k</span>
  //     <span className="opacity-80 px-[3px]">y</span>
  //     <span className="opacity-70 px-[3px]">d</span>
  //     <span className="opacity-60 px-[3px]">e</span>
  //     <span className="opacity-50 px-[3px]">c</span>
  //     <span className="opacity-40 px-[3px]">k</span>
  //   </div>
  // );

  return (
    <>
      <Head />
      <div
        ref={containerRef}
        id="container"
        className="space-gradient p-4"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <div className="flex overflow-x-scroll space-x-4">
          {widgets.map((Widget) => (
            <Widget
              key={Widget}
              remove={() => setWidgets(removeItem(widgets, Widget))}
              {...props}
            />
          ))}
        </div>
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
