"use client";

import React, { useReducer, useLayoutEffect } from "react";

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
  const initialTheme = {};
  const [theme, dispatch] = useReducer(themeReducer, initialTheme);

  useLayoutEffect(() => {
    var initialTheme;
    var string = localStorage.getItem(localStorageKey);
    try {
      initialTheme = JSON.parse(string);
    } catch (e) {
      console.log("Could not parse theme from local storage", string);
    }
    initialTheme = initialTheme || { name: "dockview-theme-light" };
    dispatch({ type: "change", name: initialTheme.name });
  }, []);

  useLayoutEffect(() => {
    document.body.classList = theme.name;
  }, [theme.name]);

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeDispatchContext.Provider value={dispatch}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeContext.Provider>
  );
}
