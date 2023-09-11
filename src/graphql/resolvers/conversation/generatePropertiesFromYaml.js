import { generate } from "./index";
import jsYaml from "js-yaml";

const resolveGeneratePropertiesFromYaml = async ({
  projectId,
  conversationId,
  yaml,
  modelName,
  temperature,
}) => {
  const prompt = (messages) => {
    return `You are an AI that analyzes conversations and generates properties that describe them. You are given a conversation in JSON and a YAML document template. The template contains the properties to generate and the instructions. You will return a new, valid YAML document that replaces the instructions with the generated property values. Imagine that this information will be used by a human to understand, classify, and respond to the conversation.

CONVERSATION INPUT:

${messages.map((message) => JSON.stringify(message)).join("\n")}

Here is information about the conversation format to help you understand it.

- Each line contains a single message in the conversation formatted as a JSON object
- The "id" property is a unique identifier for the message.
- If a message is a reply to another message in the conversation, it will contain a "replyToMessageId" property with the "id" of the message it is replying to. Use this to model the conversation as a tree
- The first message in the conversation will not have a "replyToMessageId" property.
- The "text" property contains the text of the message.
- The "timestamp" property contains the timestamp of the message in ISO 8601 format.
- The "author" property is the name of the person sending the message

Now, generate a new YAML document based on the following input, following these rules:

- Use your understanding of the full conversation to generate the properties
- If a property is a list, put the list items on separate lines and indent them
- Omit properties that were not evaluated or are empty, DO NOT RETURN empty properties
- Do not return any data from the conversation itself, only the generated properties
- Check that the YAML document is valid before returning it

YAML INPUT:

${yaml}

YAML OUTPUT:`;
  };

  const [text, finalPrompt] = await generate({
    projectId,
    conversationId,
    modelName,
    temperature,
    prompt,
  });

  const properties = [];

  try {
    if (!text) {
      console.log("LLM returned null YAML");
      return [];
    }

    const doc = jsYaml.load(text);

    for (const [name, value] of Object.entries(doc)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          properties.push({
            name,
            value: item + "",
            type: "String",
          });
        }
      } else {
        properties.push({
          name,
          value: value + "",
          type: "String",
        });
      }
    }
  } catch (e) {
    console.error(`LLM returned unparseable YAML \n\n ${text}\n\n`);
    console.log("Final prompt: \n\n" + finalPrompt + "\n\n");
    console.log(e);
    throw e;
  }

  if (properties.length === 0) {
    console.error(`LLM returned no properties in YAML \n\n ${text}\n\n`);
    console.log("Final prompt: \n\n" + finalPrompt + "\n\n");
    throw new Error(`LLM returned no properties \n\n ${text}\n\n`);
  }

  // remove any properties that have a name or value of null
  // these should not be generated but the LLM can return them
  return properties.filter(({ name, value }) => name && value);
};

export default resolveGeneratePropertiesFromYaml;
