import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SourceIcon({ activity, className }) {
  let { source } = activity;
  switch (source) {
    case "twitter":
      return (
        <FontAwesomeIcon icon="fa-brands fa-twitter" className={className} />
      );
    case "discord":
      return (
        <FontAwesomeIcon icon="fa-brands fa-discord" className={className} />
      );
    case "slack":
      return (
        <FontAwesomeIcon icon="fa-brands fa-slack" className={className} />
      );
    case "github":
    case "discussions":
      return (
        <FontAwesomeIcon icon="fa-brands fa-github" className={className} />
      );
    case "discourse":
      return (
        <FontAwesomeIcon icon="fa-brands fa-discourse" className={className} />
      );
    default:
      let cleanedSourceType = activity.sourceType
        ?.replace(/_/g, " ")
        .replace(/activity/, "");
      return (
        <span title={cleanedSourceType} className={className}>
          {activity.sourceType}
        </span>
      );
  }
}
