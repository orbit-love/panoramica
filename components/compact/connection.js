import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NameAndIcon from "components/compact/name_and_icon";

export default function CompactConnection({
  connectedMember,
  directions,
  connection,
  setConnection,
  selection,
  setSelection,
}) {
  // safety check to remove later
  if (!directions) {
    return <div />;
  }
  const isConnection = connection?.id === connectedMember.id;
  const [outgoing, incoming] = directions;
  const onClick = (event) => {
    if (event.detail === 2) {
      setConnection(null);
      setSelection(connectedMember);
    } else {
      setConnection(isConnection ? null : connectedMember);
    }
  };
  return (
    <button
      key={connectedMember.id}
      className={classnames(
        "bg-opacity-0 flex overflow-hidden items-center space-x-1 whitespace-nowrap bg-indigo-900",
        {
          "bg-opacity-50": isConnection,
          "hover:bg-opacity-30": !isConnection,
        }
      )}
      onClick={onClick}
    >
      {outgoing > 0 && (
        <div className="w-8 text-xs text-indigo-400">
          <FontAwesomeIcon icon="arrow-right" />
          {" " + outgoing}
        </div>
      )}
      <NameAndIcon
        member={connectedMember}
        onClick={onClick}
        setConnection={setConnection}
        selection={selection}
        setSelection={setSelection}
      />
      {incoming > 0 && (
        <div className="w-8 text-xs text-indigo-400">
          {incoming + " "}
          <FontAwesomeIcon icon="arrow-right" />
        </div>
      )}
    </button>
  );
}
