import React from "react";

import { Frame } from "src/components/widgets";
import ConversationTable from "src/components/widgets/LabelConversations/ConversationTable";
import ManageProjectProperty from "src/components/widgets/LabelConversations/ManageProjectProperty";
import { aiReady } from "src/integrations/ready";
import jsyaml from "js-yaml";
import utils from "src/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LabelConversations({ project }) {
  const [yamlPropertyName, setYamlPropertyName] = React.useState("");

  return (
    <Frame fullWidth>
      <div className="flex overflow-x-scroll flex-col p-4 space-y-2 w-full">
        <div className="text-lg">
          <span className="text-tertiary font-light">Label Conversations</span>
          {yamlPropertyName && (
            <>
              <span>
                {" "}
                <span className="text-gray-400">/</span> {yamlPropertyName}
              </span>
              <span onClick={() => setYamlPropertyName(null)}>
                <FontAwesomeIcon
                  icon="times"
                  className="ml-2 text-sm cursor-pointer"
                />
              </span>
            </>
          )}
        </div>
        {yamlPropertyName && (
          <WithProperyName
            project={project}
            yamlPropertyName={yamlPropertyName}
          />
        )}
        {!yamlPropertyName && (
          <ChoosePropertyName
            project={project}
            setYamlPropertyName={setYamlPropertyName}
          />
        )}
      </div>
    </Frame>
  );
}

const ChoosePropertyName = ({ project, setYamlPropertyName }) => {
  const [propertyName, setPropertyName] = React.useState("");
  const onSubmit = (e) => {
    e.preventDefault();
    setYamlPropertyName(propertyName);
  };
  const yamlPropertyNames = project.properties.filter((p) =>
    p.name.endsWith(".yaml")
  );
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="">Select a yaml for labeling conversations.</div>
      <div className="space-y-1">
        {yamlPropertyNames.map((p) => (
          <div key={p.name}>
            <button
              type="button"
              className="underline"
              onClick={() => setYamlPropertyName(p.name)}
            >
              {p.name}
            </button>
          </div>
        ))}
      </div>
      <div className="inline-flex space-x-2">
        <input
          type="text"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
        />
        <button type="submit" className="btn">
          new
        </button>
      </div>
    </form>
  );
};

const WithProperyName = ({ project, yamlPropertyName }) => {
  const yamlProperty = utils.getProperty(yamlPropertyName, project);
  var propertyNames = [];
  if (yamlProperty) {
    const yamlDoc = jsyaml.load(yamlProperty.value);
    propertyNames = Object.keys(yamlDoc);
  }
  const controlledProperties = [
    {
      name: `${yamlPropertyName}.status`,
      values: ["show", "pin", "dismiss"],
    },
  ];
  return (
    <>
      {aiReady(project) && (
        <ConversationTable
          project={project}
          yaml={yamlProperty?.value}
          propertyNames={propertyNames}
          controlledProperties={controlledProperties}
        />
      )}
      <div className="h-4" />
      <div>
        <ManageProjectProperty
          propertyName={yamlPropertyName}
          project={project}
        />
      </div>
    </>
  );
};
