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
    return `You are an AI that analyzes conversations and generates properties that describe them.

INPUTS: This is the conversation to analyze. Each line contains a single message in the conversation formatted as a JSON object:

${messages.map((message) => JSON.stringify(message)).join("\n")}

INSTRUCTIONS: Here is a YAML document that contains the properties to generate and the instructions to generate them. Return a new, valid YAML document that replaces the instructions with the generated property values.

${yaml}

RULES TO FOLLOW:
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
