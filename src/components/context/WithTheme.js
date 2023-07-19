"use client";

import React, { useState, useReducer, useEffect } from "react";

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
  // we can't access localStorage on the server so we
  // start with no theme and load from localStorage in useEffect
  const initialObject = {};
  const [object, dispatch] = useReducer(themeReducer, initialObject);

  useEffect(() => {
    var initialObject;
    var string = localStorage.getItem(localStorageKey);
    try {
      initialObject = JSON.parse(string);
    } catch (e) {
      console.log("Could not parse theme from local storage", string);
    }
    initialObject = initialObject || { name: "dockview-theme-light" };
    dispatch({ type: "change", name: initialObject.name });
  }, []);

  return (
    <ThemeContext.Provider value={object}>
      <ThemeDispatchContext.Provider value={dispatch}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeContext.Provider>
  );
}
