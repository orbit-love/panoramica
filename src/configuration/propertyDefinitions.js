export const titleDefinition = {
  name: "title",
  type: "String",
  description: "Conversation title in 5 words or less",
};

export const labels = [
  "announcement",
  "bugReport",
  "feedback",
  "introduction",
  "sharingResources",
  "spam",
  "suggestion",
  "supportQuestion",
];
export const labelsDefinition = {
  name: "labels",
  type: "[String]",
  description: `Any of these label that describe the conversation: ${labels.join(
    ","
  )}`,
};

export const topicsDefinition = {
  name: "topics",
  type: "[String]",
  description: "List of topics that describe the conversation",
};

export const supportQuestionDefinition = [
  {
    name: "supportQuestion",
    type: "String",
    description:
      "If the conversation is a question, the core question that the conversation is based on, in 1-2 sentences",
  },
  {
    name: "supportAnswerSummary",
    type: "String",
    description:
      "If the conversation is a support question, a summary of the answer in 50 words or less",
  },
  {
    name: "supportAnswerId",
    type: "String",
    description:
      "If the conversation is a support question, the id of the reply message that contains the answer. It should correspond with the supportAnswer and supportQuestion",
  },
  {
    name: "supportQuestionAnsweredBy",
    type: "String",
    description:
      "If the conversation was answered, the name of the person who answered it",
  },
  {
    name: "satisfactionScore",
    type: "String",
    description:
      "Scale of 1-10. 10 if the question asker is completely satisfied and happy. 0 if the question asker is frustrated or upset.",
  },
];

export const actionDefinitions = [
  {
    name: "needsAttention",
    type: "Boolean",
    description:
      "True if the conversation needs an answer or attention from a moderator",
  },
  {
    name: "needsModeration",
    type: "Boolean",
    description:
      "True if any message contains profanity or is otherwise inappropriate",
  },
  {
    name: "needsToBeDocumented",
    type: "Boolean",
    description:
      "True if the conversation represents useful information that should be added to guides or documentation",
  },
];

export const sentimentDefinitions = [
  {
    name: "sentimentDirection",
    type: "Int",
    description:
      "Scale of 1-10. 10 if the sentiment is overwhemingly positive. 0 if it is angry, upset, or destructive.",
  },
  {
    name: "sentimentMagnitude",
    type: "Int",
    description:
      "Scale of 1-10. 10 if the conversation is heated or has strong feelings. 0 if there is no sentiment and it's purely factual.",
  },
];

export const propertyDefinitions = [
  titleDefinition,
  {
    name: "summary",
    type: "String",
    description: "Conversation summary in 4 sentences or less",
  },
  topicsDefinition,
  labelsDefinition,
  {
    name: "trending",
    type: "Int",
    description:
      "Scale of 1-10. 10 means this conversation should be at the top of the community news feed. 0 means it should be hidden.",
  },
  {
    name: "links",
    type: "String",
    description: "List of links that were shared in the conversation",
  },
];
