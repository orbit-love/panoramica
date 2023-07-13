export const conversationPrompts = {
  Tabularize: `Please provide a tabular view of this conversation in markdown style. The columns in the table should be: the name of the message sender, the name of the message receiver, the first 40 characters of the text of the message, and a timestamp of the format "June 1 at 2:15pm", and the length of time that passed between messages in the format "1 day, 10 hours, 3 minutes"`,
  Timing: `Approximately how much time passed in this conversation from start to finish? Using timestamp property, what was the longest time between 2 replies?`,
  NextSteps: `What's the next step for this conversation and who does it belong to? Is a reply needed or is the conversation complete?`,
  Entities: `Please provide a list of up to 10 key topics that were discussed in this conversation.`,
};
