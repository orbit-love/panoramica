import React, { useState, useCallback } from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useMutation } from "@apollo/client";

import Frame from "./base/Frame";
import GetPromptsQuery from "src/graphql/queries/GetPrompts.gql";
import SetPromptsMutation from "./EditPrompts/SetPrompts.gql";
import DeletePromptsMutation from "./EditPrompts/DeletePrompts.gql";

export default function EditPrompts({ project }) {
  const { id: projectId } = project;
  const {
    data: {
      projects: [{ prompts }],
    },
  } = useSuspenseQuery(GetPromptsQuery, {
    variables: {
      projectId,
    },
  });

  const [items, setItems] = useState(prompts);
  const [message, setMessage] = useState("");

  const handleAdd = () => {
    setMessage("");
    setItems([...items, { context: "Public", label: "", prompt: "" }]);
  };

  const handleRemove = (index) => {
    setMessage("");
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChange = (index, field, value) => {
    setMessage("");
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleReorder = (direction, index) => {
    setMessage("");
    if (
      (index === 0 && direction === -1) ||
      (index === items.length - 1 && direction === 1)
    )
      return;
    const newItems = [...items];
    const item = newItems.splice(index, 1)[0];
    newItems.splice(index + direction, 0, item);
    setItems(newItems);
  };

  const [savePrompts] = useMutation(SetPromptsMutation);
  const [deletePrompts] = useMutation(DeletePromptsMutation);

  const handleSaveChanges = useCallback(async () => {
    const { name, demo, id } = project;
    const projectInput = {
      project: {
        connectOrCreate: {
          onCreate: { node: { name, demo } },
          where: { node: { id } },
        },
      },
    };

    const input = items.map(({ context, label, prompt }) => ({
      context,
      label,
      prompt,
      ...projectInput,
    }));

    await deletePrompts({ variables: { projectId: id } });
    await savePrompts({ variables: { input } });
    setMessage("Changes saved!");
  }, [project, items, savePrompts, deletePrompts, setMessage]);

  return (
    <Frame fullWidth>
      <div className="flex flex-col p-6 space-y-4">
        <div className="">
          <div className="text-tertiary text-lg">
            Edit Example Prompts for the AI Assistant
          </div>
          <div className="text-sm text-gray-500">
            The context—Conversation, Global, or Public—determines where the
            example prompt will be shown to the user.
          </div>
        </div>
        {items.map((item, index) => (
          <div key={index}>
            <ListItem
              item={item}
              onRemove={handleRemove}
              onChange={handleChange}
              index={index}
            />
            <div className="text-tertiary flex justify-end pt-1 space-x-4">
              {index > 0 && (
                <button
                  onClick={() => handleReorder(-1, index)}
                  className="hover:underline"
                >
                  Move Up
                </button>
              )}
              {index < items.length - 1 && (
                <button
                  onClick={() => handleReorder(1, index)}
                  className="hover:underline"
                >
                  Move Down
                </button>
              )}
              <button
                onClick={() => handleRemove(index)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-end items-center space-x-2">
          <div className="flex-1 grow" />
          {message && <div className="px-4 text-green-500">{message}</div>}
          <button onClick={handleAdd} className="btn !flex-none">
            Add New Item
          </button>
          <button onClick={handleSaveChanges} className="btn !flex-none">
            Save Changes
          </button>
        </div>
      </div>
    </Frame>
  );
}

function ListItem({ item, onChange, index }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <select
          value={item.context}
          onChange={(e) => onChange(index, "context", e.target.value)}
        >
          <option>Conversation</option>
          <option>Global</option>
          <option>Public</option>
        </select>
        <input
          type="text"
          value={item.label}
          placeholder="A label e.g. 'Find important topics'"
          onChange={(e) => onChange(index, "label", e.target.value)}
          className="!w-full"
        />
      </div>
      <textarea
        value={item.prompt}
        placeholder="The prompt to send to the AI assistant"
        onChange={(e) => onChange(index, "prompt", e.target.value)}
      />
    </div>
  );
}
