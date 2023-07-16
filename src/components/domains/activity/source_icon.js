import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SourceIcon({ activity }) {
  let { source } = activity;
  switch (source) {
    case "twitter":
      return <FontAwesomeIcon icon="fa-brands fa-twitter" />;
    case "discord":
      return <FontAwesomeIcon icon="fa-brands fa-discord" />;
    case "github":
      return <FontAwesomeIcon icon="fa-brands fa-github" />;
    case "discourse":
      return <FontAwesomeIcon icon="fa-brands fa-discourse" />;
    default:
      let cleanedSourceType = activity.sourceType
        ?.replace(/_/g, " ")
        .replace(/activity/, "");
      return <span title={cleanedSourceType}>{activity.sourceType}</span>;
  }
}
