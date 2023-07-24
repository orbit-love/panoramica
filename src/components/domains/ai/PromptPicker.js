import React from "react";

export default function PromptPicker({ prompts, pickPrompt }) {
  return (
    <div className="text-tertiary font-light">
      <div className="mb-1">Need an idea? Try an example prompt:</div>
      <ul className="list-disc list-inside">
        {Object.keys(prompts).map((promptKey) => (
          <li key={promptKey}>
            <button
              className="hover:underline"
              onClick={() => pickPrompt(prompts[promptKey].prompt)}
            >
              {prompts[promptKey].human}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
