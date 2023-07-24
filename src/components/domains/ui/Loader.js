import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

export default function Loader({ className }) {
  return (
    <FontAwesomeIcon
      icon="circle-notch"
      spin
      className={classnames({ className, "text-tertiary": !className })}
    />
  );
}
