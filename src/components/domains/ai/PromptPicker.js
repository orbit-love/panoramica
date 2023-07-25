import React from "react";

export default function PromptPicker({ prompts, pickPrompt }) {
  return (
    <div className="text-tertiary font-light">
      <div className="mb-1">Need an idea? Try an example prompt:</div>
      <ul className="flex-col">
        {Object.keys(prompts).map((promptKey) => (
          <li key={promptKey}>
            <div
              className="cursor-pointer hover:underline"
              onClick={() => pickPrompt(prompts[promptKey].prompt)}
            >
              &middot; {prompts[promptKey].human}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
