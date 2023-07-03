import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SourceIcon({ activity }) {
  let { source } = activity;
  switch (source) {
    case "twitter":
      return (
        <FontAwesomeIcon
          icon="fa-brands fa-twitter"
          // className="text-[#1DA1F2]"
        />
      );
    case "discord":
      return (
        <FontAwesomeIcon
          icon="fa-brands fa-discord"
          // className="text-[#5865f2]"
        />
      );
    case "github":
      return <FontAwesomeIcon icon="fa-brands fa-github" />;
    case "discourse":
      return (
        <FontAwesomeIcon
          icon="fa-brands fa-discourse"
          // className="text-[#D0232B]"
        />
      );
    default:
      let cleanedSourceType = activity.sourceType
        ?.replace(/_/g, " ")
        .replace(/activity/, "");
      return <span title={cleanedSourceType}>{activity.sourceType}</span>;
  }
}
