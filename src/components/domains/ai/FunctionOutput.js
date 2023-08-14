import React, { useState } from "react";
import ConversationFeed from "../feed/ConversationFeed";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function FunctionOutput({ project, functionOutput }) {
  const [closed, setClosed] = useState(false);

  const conversationsContext = (searchTerm, docs) => {
    // const activities = docs.map(({ id }) => community.findActivityById(id));
    const activities = [];
    const handlers = { onClickMember: () => {} };
    return (
      <div className="flex-col mt-1 space-y-1">
        <h4 className="text-tertiary">
          Conversations added to the current context
        </h4>
        <small className="block pb-1">
          Search term: &quot;{searchTerm}&quot;
        </small>
        <ConversationFeed
          project={project}
          activities={activities}
          handlers={handlers}
          minimal={true}
        />
      </div>
    );
  };

  const documentationContext = (searchTerm, docs) => {
    return (
      <div className="my-1">
        <h4 className="text-tertiary">
          Documentation pages in the current context:
        </h4>
        <small>Search term: &quot;{searchTerm}&quot;</small>
        <ul className="flex-col mt-4">
          {docs.map(({ url, title }) => (
            <li key={url}>
              <a href={url} className="font-light underline">
                {title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="border-t-1 py-2 px-4 bg-gray-50 rounded-t-lg dark:bg-gray-900">
      <div className="flex justify-center">
        <button
          className="text-tertiary w-full"
          onClick={(_) => setClosed(!closed)}
        >
          {closed && <FontAwesomeIcon icon="fa-chevron-up" />}
          {!closed && <FontAwesomeIcon icon="fa-chevron-down" />}
        </button>
      </div>
      <div className="overflow-y-auto max-h-40">
        {!closed &&
          functionOutput.name === "search_conversations" &&
          conversationsContext(functionOutput.args[0], functionOutput.output)}
        {!closed &&
          functionOutput.name === "search_documentation" &&
          documentationContext(functionOutput.args[0], functionOutput.output)}
        {!closed &&
          functionOutput.name === "search_conversations_and_documentation" && (
            <>
              {conversationsContext(
                functionOutput.args[0],
                functionOutput.output[0]
              )}
              <div className="mt-4"></div>
              {documentationContext(
                functionOutput.args[1],
                functionOutput.output[1]
              )}
            </>
          )}
      </div>
    </div>
  );
}
