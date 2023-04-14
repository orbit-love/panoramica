import React from "react";
import c from "components/2023/common";

export default function Member({ selection }) {
  return <div className="text-lg">{selection.name}</div>;
}
