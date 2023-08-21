import { generate } from "./index";
import jsYaml from "js-yaml";

const resolveGeneratePropertiesFromYaml = async ({
  projectId,
  activityId,
  yaml,
  modelName,
  temperature,
}) => {
  const prompt = (messages) => {
    return `You are an AI that analyzes conversations and generates properties that describe them. You are given a conversation and a YAML document that contains the properties to generate and the instructions to generate them. Return a new, valid YAML document that replaces the instructions with the generated property values. Imagine that this information will be used by a human to understand, classify, and respond to the conversation.

Here is information about the conversation format to help you understand it.

- Each line contains a single message in the conversation formatted as a JSON object
- The "id" property is a unique identifier for the message.
- If a message is a reply to another message in the conversation, it will contain a "replyToMessageId" property with the "id" of the message it is replying to. Use this to model the conversation as a tree
- The first message in the conversation will not have a "replyToMessageId" property.
- The "text" property contains the text of the message.
- The "timestamp" property contains the timestamp of the message in ISO 8601 format.
- The "author" property is the name of the person sending the message

CONVERSATION INPUT:

${messages.map((message) => JSON.stringify(message)).join("\n")}

YAML INPUT:

${yaml}

RULES TO FOLLOW:
- Use your understanding of the full conversation to generate the properties
- Do not add any unnecessary characters or punctuation, e.g. surrounding quotes with strings when it's not required
- Escape any special characters that are required by the YAML specification
- If a property is a list, put the list items on separate lines and indent them
- Omit properties that were not evaluated or are empty

REMEMBER, ONLY OUTPUT YAML. THE COMPLETED DOCUMENT:`;
  };

  const text = await generate({
    projectId,
    activityId,
    modelName,
    temperature,
    prompt,
  });

  const properties = [];

  try {
    const doc = jsYaml.load(text);

    for (const [name, value] of Object.entries(doc)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          properties.push({
            name,
            value: item,
            type: "String",
          });
        }
      } else {
        properties.push({
          name,
          value,
          type: "String",
        });
      }
    }
  } catch (e) {
    console.error(`LLM returned unparseable YAML \n\n ${text}\n\n`, e);
    throw e;
  }

  if (properties.length === 0) {
    throw new Error(`LLM returned no properties \n\n ${text}\n\n`);
  }

  return properties;
};

export default resolveGeneratePropertiesFromYaml;
