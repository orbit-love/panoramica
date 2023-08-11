import React, { useState } from "react";
import ConversationFeed from "../feed/ConversationFeed";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function FunctionOutput({ project, community, functionOutput }) {
  const [closed, setClosed] = useState(false);

  const conversationsContext = (searchTerm, docs) => {
    const activities = docs.map(({ id }) => community.findActivityById(id));
    const handlers = { onClickMember: () => {} };
    return (
      <div className="mt-1 flex-col space-y-1">
        <h4 className="text-tertiary">
          Conversations added to the current context
        </h4>
        <small className="block pb-1">Search term: "{searchTerm}"</small>
        <ConversationFeed
          project={project}
          activities={activities}
          community={community}
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
        <small>Search term: "{searchTerm}"</small>
        <ul className="flex-col mt-4">
          {docs.map(({ url, title }) => (
            <li key={url}>
              <a href={url} className="underline font-light">
                {title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="px-4 py-2 rounded-t-lg border-t-1 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-center">
        <button
          className="w-full text-tertiary"
          onClick={(_) => setClosed(!closed)}
        >
          {closed && <FontAwesomeIcon icon="fa-chevron-up" />}
          {!closed && <FontAwesomeIcon icon="fa-chevron-down" />}
        </button>
      </div>
      <div className="max-h-40 overflow-y-auto">
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
