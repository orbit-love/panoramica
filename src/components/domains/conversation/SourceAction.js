import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import utils from "src/utils";

export default function SourceAction({ children, activity, className }) {
  return (
    <>
      {activity.url && (
        <Link
          href={activity.url}
          title={`Open on ${utils.titleize(activity.source)}`}
          target="_blank"
          className={className}
        >
          <FontAwesomeIcon icon="external-link" /> {children}
        </Link>
      )}
    </>
  );
}
