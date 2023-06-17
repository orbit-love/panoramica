import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import NameAndIcon from "components/compact/name_and_icon";
import Entity from "components/compact/entity";

export default function Selection({
  connection,
  selection,
  setSelection,
  setConnection,
  entity,
  setEntity,
}) {
  var title;
  if (selection?.actor) {
    if (connection) {
      title = (
        <>
          <NameAndIcon
            member={selection}
            setConnection={setConnection}
            selection={selection}
            setSelection={setSelection}
            onClick={() => setSelection(null)}
          />
          <FontAwesomeIcon
            icon="right-left"
            className="text-xs text-indigo-600"
          />
          <NameAndIcon
            member={connection}
            setConnection={setConnection}
            selection={selection}
            setSelection={setSelection}
            onClick={() => setConnection(null)}
          />
        </>
      );
    } else {
      title = (
        <NameAndIcon
          member={selection}
          setConnection={setConnection}
          selection={selection}
          setSelection={setSelection}
        />
      );
    }
  } else if (selection?.number) {
    title = <div>Orbit {selection.number}</div>;
  }

  if (entity) {
    title = (
      <>
        {title}
        <div className="text-xs">
          <Entity entity={entity} setEntity={setEntity} active={true} />
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center py-2 px-4 space-x-3 w-full text-sm">
      {title && title}
      {!title && (
        <div className="text-sm text-indigo-700">
          Selected members, connections, and topics appear here.
        </div>
      )}
    </div>
  );
}
