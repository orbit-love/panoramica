export const titleDefinition = {
  name: "title",
  type: "String",
  description: "Conversation title in 5 words or less",
};

export const propertyDefinitions = [
  titleDefinition,
  {
    name: "summary",
    type: "String",
    description: "Conversation summary in 4 sentences or less",
  },
  {
    name: "topics",
    type: "[String]",
    description: "List of topics that describe the conversation",
  },
  {
    name: "members",
    type: "[String]",
    description: "The name of each member in the conversation",
  },
  {
    name: "isSpam",
    type: "Boolean",
    description:
      "True if the first messages or most messages in the conversation are spam",
  },
  {
    name: "isBug",
    type: "Boolean",
    description:
      "True if the conversation is a report of a bug or error, false otherwise",
  },
  {
    name: "isAnnouncement",
    type: "Boolean",
    description:
      "True if the conversation is an announcement of a product, feature, software update, or bug fix; false otherwise",
  },
  {
    name: "isBot",
    type: "Boolean",
    description:
      "True if the first message or most messages in the conversation are from a bot or appear to be automated",
  },
  {
    name: "isIntroduction",
    type: "Boolean",
    description:
      "True if the conversation is primarily an introduction, false otherwise.",
  },
  {
    name: "isFeedback",
    type: "Boolean",
    description:
      "True if the conversation was started to provide feedback about a product or the community, false otherwise",
  },
  {
    name: "isSupportQuestion",
    type: "Boolean",
    description:
      "True if the purpose of the conversation is to answer a support question, false otherwise",
  },
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
    name: "needsAttention",
    type: "Boolean",
    description:
      "True if the conversation needs an answer or attention from a moderator, false otherwise",
  },
  {
    name: "needsModeration",
    type: "Boolean",
    description:
      "True if any message contains profanity or is otherwise inappropriate, false otherwise",
  },
  {
    name: "duration",
    type: "String",
    description:
      "If the conversation has more than 1 message, the amount of time that passed between the first and last message output like '1 day 2 hours 3 minutes'",
  },
  {
    name: "usefulness",
    type: "Int",
    description:
      "Scale of 1-10. 10 means the conversation would be useful to most community members. 1 means it is not interesting.",
  },
  {
    name: "links",
    type: "String",
    description: "List of links that were shared in the conversation",
  },
];
