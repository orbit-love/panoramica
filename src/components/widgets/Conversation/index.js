import React, { useEffect, useCallback } from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useMutation, useLazyQuery } from "@apollo/client";
import Link from "next/link";

import { aiReady } from "src/integrations/ready";
import Chat from "src/components/domains/ai/Chat";
import BookmarkAction from "src/components/domains/bookmarks/BookmarkAction";
import PinAction from "src/components/domains/pins/PinAction";
import SimilarAction from "src/components/domains/conversation/SimilarAction";
import SourceAction from "src/components/domains/conversation/SourceAction";
import GetPromptsByContextQuery from "src/graphql/queries/GetPromptsByContext.gql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import GenerateConversationProperties from "src/graphql/queries/GenerateConversationProperties.gql";
import ReplaceActivityPropertyMutation from "src/graphql/mutations/ReplaceActivityProperty.gql";
import { titleDefinition } from "src/configuration/propertyDefinitions";

export const ChatArea = ({ project, conversation }) => {
  const { id: projectId } = project;
  const context = "Conversation";
  const {
    data: {
      projects: [{ prompts }],
    },
  } = useSuspenseQuery(GetPromptsByContextQuery, {
    variables: {
      projectId,
      context,
    },
  });

  const subContext = { conversationId: conversation.id };
  return (
    <>
      {project.modelName && (
        <Chat
          project={project}
          subContext={subContext}
          examplePrompts={prompts}
        />
      )}
      {!project.modelName && (
        <div className="p-6 text-red-500">
          LLM and vector stores are not configured. Edit the project and add the
          necessary information to enable AI features.
        </div>
      )}
    </>
  );
};

const GeneratedTitleProperty = ({
  project,
  conversation,
  title,
  setTitle,
  setConversation,
}) => {
  const [replaceActivityProperty] = useMutation(
    ReplaceActivityPropertyMutation
  );

  // handle newly generated properties by updating the conversation
  // and title state and then persisting with a mutation
  const handleGeneratedProperties = useCallback(
    (data) => {
      const {
        projects: [
          {
            activities: [{ generateProperties }],
          },
        ],
      } = data;
      const titleProperty = generateProperties.find(
        (property) => property.name === "title"
      );

      if (titleProperty) {
        setTitle(titleProperty.value);
        setConversation((conversation) => ({
          ...conversation,
          properties: conversation.properties
            ?.filter((property) => property.name !== "title")
            .concat(titleProperty),
        }));

        replaceActivityProperty({
          variables: {
            conversationId: conversation.id,
            ...titleProperty,
          },
        });
      }
    },
    [setTitle, setConversation, replaceActivityProperty, conversation]
  );

  // skip the query if title exists and has a value
  // no-cache prevents the mutation above from re-running this query
  // not sure if that's the best way to do this
  const [generateProperties] = useLazyQuery(GenerateConversationProperties, {
    onCompleted: handleGeneratedProperties,
    fetchPolicy: "no-cache",
    variables: {
      projectId: project.id,
      conversationId: conversation.id,
      definitions: [titleDefinition],
      modelName: "gpt-4",
      temperature: 0.1,
    },
  });

  // if the title property is present, update the title
  // normally this won't change anything, but if the title is out
  // of sync with the conversation it'll fix it; if the title property is
  // not present, generate it
  useEffect(() => {
    const titleProperty = conversation.properties?.find(
      (property) => property.name === "title"
    );
    if (titleProperty?.value) {
      setTitle(titleProperty.value);
    } else {
      generateProperties();
    }
  }, [conversation, setTitle, generateProperties]);

  return (
    <div
      onClick={() => {
        generateProperties();
      }}
      className="overflow-hidden font-semibold text-ellipsis"
    >
      {title}
    </div>
  );
};

const SimpleTitleProperty = ({ conversation }) => {
  const activity = conversation.descendants[0];
  const title = activity.text.slice(0, 50);
  return (
    <div className="overflow-hidden font-semibold text-ellipsis">{title}</div>
  );
};

export const TitleBar = ({
  project,
  conversation,
  setConversation,
  title,
  setTitle,
}) => {
  return (
    <div className="flex justify-between items-start pb-4 px-6 space-x-2 border-b border-gray-300 dark:border-gray-800">
      <div>
        {!aiReady(project) && (
          <SimpleTitleProperty conversation={conversation} />
        )}
        {aiReady(project) && (
          <GeneratedTitleProperty
            project={project}
            conversation={conversation}
            setConversation={setConversation}
            title={title}
            setTitle={setTitle}
          />
        )}
      </div>
      <div className="text-tertiary flex space-x-2">
        <BookmarkAction project={project} conversation={conversation} />
        <React.Suspense fallback={<div></div>}>
          <PinAction project={project} conversation={conversation} />
        </React.Suspense>
        <SimilarAction conversation={conversation} />
        <SourceAction conversation={conversation} />
        {project.demo && (
          <Link
            href={`/projects/${project.id}/welcome/${conversation.id}`}
            target="_blank"
            title="View on public site"
          >
            <FontAwesomeIcon icon="external-link" />
          </Link>
        )}
      </div>
    </div>
  );
};

export const Property = ({
  name,
  displayName = name,
  properties: allProperties,
}) => {
  const properties = allProperties.filter((property) => property.name === name);
  const values = properties.map((property) => property.value);
  return (
    <>
      {properties.length > 0 && (
        <div className="mr-1 text-gray-500">
          <span>{displayName}: </span>
          <span className="font-semibold">{values.join(", ")}</span>
        </div>
      )}
    </>
  );
};
