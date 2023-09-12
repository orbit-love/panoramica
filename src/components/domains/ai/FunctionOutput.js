import React, { useState } from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConversationFeedItem from "../feed/ConversationFeedItem";
import GetConversationsByIdsQuery from "src/graphql/queries/GetConversationsByIds.gql";

export default function FunctionOutput({ project, functionOutput }) {
  const [closed, setClosed] = useState(false);

  const conversationsContext = (searchTerm, conversations) => {
    const handlers = { onClickMember: () => {} };
    return (
      <div className="flex-col mt-1 space-y-1">
        <h4 className="text-tertiary">
          Conversations added to the current context
        </h4>
        <small className="block pb-1">
          Search term: &quot;{searchTerm}&quot;
        </small>
        {conversations.map((conversation) => (
          <ConversationFeedItem
            key={conversation.id}
            conversation={conversation}
            project={project}
            handlers={handlers}
          />
        ))}
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

  const { id: projectId } = project;

  const getConversationDocs = () => {
    switch (functionOutput.name) {
      case "search_conversations":
        return functionOutput.output;
      case "search_conversations_and_documentation":
        return functionOutput.output[1];
      default:
        return [];
    }
  };

  const ids = getConversationDocs().map(({ id }) => id);

  const { data } = useQuery(GetConversationsByIdsQuery, {
    variables: { projectId, ids },
  });
  if (!data) return null;
  const conversations = data.projects[0].conversations;

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
          conversationsContext(functionOutput.args[0], conversations)}
        {!closed &&
          functionOutput.name === "search_documentation" &&
          documentationContext(functionOutput.args[0], functionOutput.output)}
        {!closed &&
          functionOutput.name === "search_conversations_and_documentation" && (
            <>
              {conversationsContext(functionOutput.args[0], conversations)}
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
