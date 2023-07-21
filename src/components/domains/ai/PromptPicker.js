import React from "react";

export default function PromptPicker({ prompts, pickPrompt }) {
  return (
    <>
      <div className="mb-1">Load an example prompt:</div>
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
    </>
  );
}
