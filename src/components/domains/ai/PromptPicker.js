import React from "react";

export default function PromptPicker({ prompts, pickPrompt }) {
  return (
    <div className="text-tertiary font-light">
      <div className="mb-1 font-semibold">Try an example prompt:</div>
      <ul className="flex-col">
        {prompts.map(({ label, prompt }) => (
          <li key={label}>
            <div onClick={() => pickPrompt(prompt)}>
              &middot;{" "}
              <span className="cursor-pointer hover:underline">{label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
