export const conversationPrompts = {
  Tabularize: `Please provide a tabular view of this conversation in markdown style. The columns in the table should be: the name of the message sender, the name of the message receiver, the first 40 characters of the text of the message, and a timestamp of the format "June 1 at 2:15pm", and the length of time that passed between messages in the format "1 day, 10 hours, 3 minutes"`,
  Timing: `Approximately how much time passed in this conversation from start to finish? Using timestamp property, what was the longest time between 2 replies?`,
  NextSteps: `What's the next step for this conversation and who does it belong to? Is a reply needed or is the conversation complete?`,
  Topics: `Please provide a list of several key topics that were discussed in this conversation.`,
  Translate: `Please translate this conversation into French. Translate one message at a time, starting with the first message given in the context. Display the entirety of each message in plain, human-readable text with 2 lines between each message. Preface each message with the name of the sender.`,
};
