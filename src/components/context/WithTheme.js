"use client";

import React, { useReducer } from "react";

import {
  ThemeContext,
  ThemeDispatchContext,
} from "src/components/context/ThemeContext";

export const localStorageKey = "panoramica-theme";
const themeReducer = (_, { type, name }) => {
  switch (type) {
    case "change": {
      return { name };
    }
  }
};

export default function WithTheme({ children }) {
  var initialObject;
  if (typeof localStorage !== "undefined") {
    var string = localStorage.getItem(localStorageKey);
    try {
      initialObject = JSON.parse(string);
    } catch {}
  }
  initialObject = initialObject || { name: "dockview-theme-light" };

  const [object, dispatch] = useReducer(themeReducer, initialObject);
  return (
    <ThemeContext.Provider value={object}>
      <ThemeDispatchContext.Provider value={dispatch}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeContext.Provider>
  );
}
