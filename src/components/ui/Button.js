import React from "react";
import c from "src/configuration/common";
import classnames from "classnames";

export default function Button({ onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      className={classnames(c.buttonClasses, className)}
    >
      {children}
    </button>
  );
}
