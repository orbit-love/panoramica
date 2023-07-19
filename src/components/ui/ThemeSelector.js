import { React, useContext } from "react";

import c from "src/configuration/common";
import {
  ThemeContext,
  ThemeDispatchContext,
} from "src/components/context/ThemeContext";
import { localStorageKey } from "src/components/context/WithTheme";

export default function ThemeSelector() {
  const theme = useContext(ThemeContext);
  const dispatch = useContext(ThemeDispatchContext);

  const onSelectTheme = (name) => {
    dispatch({ type: "change", name });
    localStorage.setItem(localStorageKey, JSON.stringify({ name }));
  };

  const availableThemes = [
    "dockview-theme-light",
    "dockview-theme-dark",
    "dockview-theme-abyss",
    "dockview-theme-vs",
    "dockview-theme-dracula",
  ];

  return (
    <form className="px-4 py-4 pb-10 w-96">
      <ul className="flex flex-col space-y-1">
        {availableThemes.map((name) => (
          <li key={name}>
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                name="theme"
                className="hover:underline"
                onClick={() => onSelectTheme(name)}
                value={name}
                defaultChecked={name === theme.name}
              ></input>
              <span>{c.titleize(name.split("-").slice(-1)[0])}</span>
            </label>
          </li>
        ))}
      </ul>
    </form>
  );
}
