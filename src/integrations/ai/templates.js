export const PROMPT_TEMPLATE = `
You're an AI that helps me answer some questions about the online community I manage.
{context_intro}
Context: {context}
Please use the messages above when possible to answer my questions.

On going chat between Me and You:
{chat_history}

Task: Based on the provided context, answer me.

Note: in your reply, always format dates and times in a human-readable fashion such as "June 1 at 10pm" or "2 hours and 5 minutes".
Be succinct and don't explain your work unless asked. Do not return messageIds in the response. If the context doesn't help, say so.

Your answer:
`;

export const SINGLE_CONVERSATION_CONTEXT_INTRO = `
The following context is a conversation that took place in my community.
Each message is given as a JSON object on a newline in chronological order.
If a message is a reply to another message, the replyToMessageId
property will point to the parent message.
`;

export const PROJECT_CONVERSATIONS_CONTEXT_INTRO = `
These are one or more conversations that took place in my community.
Each message is given as a JSON object on a newline in chronological order.
Separate conversations are separated by 2 blank lines and the words "Next Conversation".
If a message is a reply to another message, the replyToMessageId property will point to the parent message
`;
