import { React, useContext } from "react";

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
    <div className="flex items-start p-4 py-12 px-24 space-x-3 bg-white">
      <ul>
        {availableThemes.map((name) => (
          <li key={name}>
            {name === theme.name && <span className="opacity-50">{name}</span>}
            {name !== theme.name && (
              <button
                className="hover:underline"
                onClick={() => onSelectTheme(name)}
              >
                {name}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
