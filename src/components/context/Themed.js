"use client";

import React, { useReducer, useLayoutEffect } from "react";
import themes from "src/configuration/themes";

import {
  ThemeContext,
  ThemeDispatchContext,
} from "src/components/context/ThemeContext";

export const localStorageKey = "panoramica-theme";
const themeReducer = (_, { type, ...props }) => {
  switch (type) {
    case "change": {
      return { name, ...props };
    }
  }
};

export const themeFor = (name) => themes.find((theme) => theme.name === name);

export default function Themed({ children }) {
  // we can't access localStorage on the server so we
  // start with no theme and load from localStorage in useEffect
  const initialTheme = themes[0];
  const [theme, dispatch] = useReducer(themeReducer, initialTheme);

  useLayoutEffect(() => {
    var initialTheme;
    var string = localStorage.getItem(localStorageKey);
    try {
      initialTheme = JSON.parse(string);
    } catch (e) {
      console.log("Could not parse theme from local storage", string);
    }
    dispatch({ type: "change", ...initialTheme });
  }, []);

  useLayoutEffect(() => {
    var { bodyTheme, tailwindTheme } = theme;
    document.body.classList = bodyTheme;
    if (tailwindTheme === "dark") {
      document.body.parentNode.classList.add("dark");
    } else {
      document.body.parentNode.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeDispatchContext.Provider value={dispatch}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeContext.Provider>
  );
}
