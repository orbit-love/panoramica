import { React, useContext } from "react";

import { availableThemes, themeFor } from "src/components/context/WithTheme";
import {
  ThemeContext,
  ThemeDispatchContext,
} from "src/components/context/ThemeContext";
import { localStorageKey } from "src/components/context/WithTheme";

export default function ThemeSelector() {
  const theme = useContext(ThemeContext);
  const dispatch = useContext(ThemeDispatchContext);

  const onSelectTheme = (name) => {
    const theme = themeFor(name);
    dispatch({ type: "change", ...theme });
    localStorage.setItem(localStorageKey, JSON.stringify(theme));
  };

  return (
    <form className="w-[400px] px-4 py-4 pb-16">
      <ul className="flex flex-col space-y-1">
        {availableThemes.map(({ name }) => (
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
              <span>{name}</span>
            </label>
          </li>
        ))}
      </ul>
    </form>
  );
}
