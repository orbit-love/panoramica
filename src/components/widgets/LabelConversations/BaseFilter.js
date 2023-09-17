import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import utils from "src/utils";

const availableOperations = [
  "Equals",
  "Not Equals",
  // "Contains", doesn't work yet
  "Exists",
  "Not Exists",
];

export default function BaseFilter({
  name,
  displayName = name,
  initialValue = "",
  initialOperation = "Equals",
  values,
  onChange,
  onClear,
  operations = availableOperations,
}) {
  const [operation, setOperation] = React.useState(initialOperation);
  const [value, setValue] = React.useState(initialValue);
  const [inputValue, setInputValue] = React.useState(
    initialOperation === "Contains" ? initialValue : ""
  );
  const previousValue = utils.usePrevious(value);
  const previousOperation = utils.usePrevious(operation);

  const active =
    (operation && value) ||
    operation === "Exists" ||
    operation === "Not Exists";

  React.useEffect(() => {
    if (previousValue !== value || previousOperation !== operation) {
      if (active) {
        onChange({
          name,
          operation,
          value,
        });
      } else {
        onClear({ name });
      }
    }
  }, [
    name,
    active,
    operation,
    value,
    previousValue,
    previousOperation,
    onChange,
    onClear,
  ]);

  return (
    <tr>
      <td className="p-2 font-semibold text-right">{displayName}</td>
      <td className="p-2">
        <select
          value={operation}
          onChange={(e) => {
            setOperation(e.target.value);
            setValue("");
          }}
        >
          {operations.map((operation) => (
            <option key={operation} value={operation}>
              {operation}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2">
        {(operation === "Equals" || operation === "Not Equals") && (
          <select
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            className="max-w-[200px]"
          >
            <option value="">Select value</option>
            {values.map(({ value, count }, index) => (
              <option key={index} value={value}>
                {value} {count && `(${count})`}
              </option>
            ))}
          </select>
        )}
        {operation === "Contains" && (
          <div className="flex space-x-2">
            <div>
              <input
                type="text"
                value={inputValue}
                required
                onChange={(e) => {
                  setInputValue(e.target.value);
                }}
              />
            </div>
            <button
              type="button"
              className="btn"
              disabled={value === inputValue}
              onClick={() => {
                setValue(inputValue);
              }}
            >
              Apply
            </button>
          </div>
        )}
      </td>
      <td>
        {active && (
          <button
            className="underline"
            onClick={() => {
              setOperation(initialOperation);
              setValue(initialValue);
              onClear({ name });
            }}
          >
            <FontAwesomeIcon icon="trash" className="text-red-500" />
          </button>
        )}
      </td>
    </tr>
  );
}
