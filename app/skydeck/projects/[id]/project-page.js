"use client";

import React, { useState, useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Link from "next/link";

import levelsData from "data/levels";
import { Home, Search, Source } from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function removeItem(array, item) {
  const index = array.indexOf(item);
  if (index !== -1) {
    let newArray = [...array]; // copy the array
    newArray.splice(index, 1); // remove the item
    return newArray;
  }
  return array; // return the original array if item was not found
}

let HomeWidget = (props) => <Home {...props} />;
let ActivitiesWidget = (props) => (
  <Source source={null} title="All Activity" {...props} />
);
let SearchWidget = (props) => <Search title="Search" {...props} />;
let defaultWidgets = [HomeWidget, SearchWidget, ActivitiesWidget];

export default function Page({ _project }) {
  const containerRef = useRef();
  const [project, setProject] = useState(_project);

  const [community, setCommunity] = useState(null);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [widgets, setWidgets] = useState(defaultWidgets);

  let removeWidget = useCallback(
    (widget) => {
      setWidgets(removeItem(widgets, widget));
    },
    [widgets, setWidgets]
  );
  let resetWidgets = useCallback(() => {
    setWidgets(defaultWidgets);
  }, [setWidgets]);

  // transform levels into a map
  const levels = {};
  levelsData.forEach((levelData) => {
    levels[levelData.number] = {
      ...levelData,
    };
  });

  const props = {
    project,
    setProject,
    community,
    setCommunity,
    low,
    setLow,
    high,
    setHigh,
    levels,
    widgets,
    setWidgets,
    removeWidget,
    resetWidgets,
  };

  useHotkeys("escape", () => resetWidgets(), [resetWidgets]);
  useHotkeys("backspace", () => setWidgets(widgets.slice(0, -1)), [
    widgets,
    setWidgets,
  ]);

  var Logo = (
    <div className="flex flex-col space-y-1 text-2xl font-thin">
      <span className="opacity-90">s</span>
      <span className="opacity-80">k</span>
      <span className="opacity-80">y</span>
      <span className="opacity-70">d</span>
      <span className="opacity-60">e</span>
      <span className="opacity-50">c</span>
      <span className="opacity-40">k</span>
    </div>
  );

  let addWidget = useCallback(
    (widget, index) => {
      setWidgets([
        ...widgets.slice(0, index),
        widget,
        ...widgets.slice(index, widgets.length),
      ]);
    },
    [widgets]
  );

  return (
    <div
      ref={containerRef}
      id="container"
      className="space-gradient p-4"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="flex overflow-x-scroll space-x-3">
        <div className="flex flex-col py-3 pr-3 space-y-2 h-full text-indigo-600">
          <Link
            prefetch={false}
            className="underline hover:text-indigo-400"
            href={`/skydeck`}
          >
            <FontAwesomeIcon icon="arrow-left" />
          </Link>
          <div>{Logo}</div>
        </div>
        {widgets.map((Widget, index) => (
          <Widget
            key={index}
            index={index}
            remove={() => removeWidget(Widget)}
            addWidget={(widget) => addWidget(widget, index + 1)}
            {...props}
          />
        ))}
      </div>
    </div>
  );
}
