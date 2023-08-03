import React, { useState, useEffect } from "react";
import { putUpdatePrompts } from "src/data/client/fetches/prompts";
import Frame from "./base/Frame";

export default function EditPrompts({ project, prompts, dispatch }) {
  const [items, setItems] = useState(prompts);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setItems(prompts);
  }, [prompts]);

  const handleAdd = () => {
    setMessage("");
    setItems([...items, { type: "Public", label: "", prompt: "" }]);
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

  const handleSaveChanges = () => {
    putUpdatePrompts({
      project,
      prompts: items,
      onSuccess: ({ result: { prompts } }) => {
        dispatch({
          type: "updatePrompts",
          prompts,
        });
        setMessage("Changes saved!");
      },
    });
  };

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
          value={item.type}
          onChange={(e) => onChange(index, "type", e.target.value)}
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
