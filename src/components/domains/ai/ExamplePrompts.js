import React from "react";

export default function ExamplePrompts({ runPrompt }) {
  return (
    <>
      <div className="mb-1">Load an example prompt:</div>
      <ul className="list-disc list-inside">
        <li>
          <button
            className="hover:underline"
            onClick={() => runPrompt("NextSteps")}
          >
            Determine the next steps
          </button>
        </li>
        <li>
          <button
            className="hover:underline"
            onClick={() => runPrompt("Topics")}
          >
            List the key topics discussed
          </button>
        </li>
        <li>
          <button
            className="hover:underline"
            onClick={() => runPrompt("Translate")}
          >
            Translate the conversation into French
          </button>
        </li>
        <li>
          <button
            className="hover:underline"
            onClick={() => runPrompt("Timing")}
          >
            Analyze the time between messages
          </button>
        </li>
        <li>
          <button
            className="hover:underline"
            onClick={() => runPrompt("Tabularize")}
          >
            Display the conversation as a table
          </button>
        </li>
      </ul>
    </>
  );
}
