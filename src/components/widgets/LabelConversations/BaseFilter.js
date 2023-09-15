import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import utils from "src/utils";

export default function BaseFilter({
  name,
  displayName = name,
  initialValue = "",
  initialOperation = "Equals",
  values,
  onChange,
  onClear,
}) {
  const [operation, setOperation] = React.useState(initialOperation);
  const [value, setValue] = React.useState(initialValue);
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
          <option value="Equals">Equals</option>
          <option value="Not Equals">Not Equals</option>
          <option value="Contains">Contains</option>
          <option value="Exists">Exists</option>
          <option value="Not Exists">Not Exists</option>
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
          <div>
            <input
              type="text"
              value={value}
              required
              onChange={(e) => {
                setValue(e.target.value);
              }}
            />
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
