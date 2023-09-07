import React from "react";

import { Frame } from "src/components/widgets";
import ConversationTable from "src/components/widgets/LabelConversations/ConversationTable";
import ManageProjectProperty from "src/components/widgets/LabelConversations/ManageProjectProperty";
import { aiReady } from "src/integrations/ready";
import jsyaml from "js-yaml";
import utils from "src/utils";

export default function LabelConversations({ project }) {
  const yamlPropertyName = "example.yaml";
  const yamlProperty = utils.getProperty(yamlPropertyName, project);
  // parse the yaml and get the top-level property names
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
    <Frame fullWidth>
      <div className="flex overflow-x-scroll flex-col p-4 space-y-2 w-full">
        <div className="text-tertiary text-lg font-light">
          Label Conversations
        </div>
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
      </div>
    </Frame>
  );
}
