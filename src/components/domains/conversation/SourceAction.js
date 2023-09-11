import React from "react";
import Link from "next/link";
import utils from "src/utils";
import SourceIcon from "src/components/domains/activity/SourceIcon";

export default function SourceAction({ children, conversation, className }) {
  const activity = conversation.descendants[0];
  return (
    <>
      {activity.url && (
        <Link
          href={activity.url}
          title={`Open on ${utils.titleize(activity.source)}`}
          target="_blank"
          className={className}
        >
          <SourceIcon activity={activity} /> {children}
        </Link>
      )}
    </>
  );
}
