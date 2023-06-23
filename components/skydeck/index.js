import React from "react";

export { default as Home } from "components/skydeck/home";
export { default as Frame } from "components/skydeck/frame";
export { default as Header } from "components/skydeck/header";
export { default as Entity } from "components/skydeck/entity";
export { default as Member } from "components/skydeck/member";
export { default as Members } from "components/skydeck/members";
export { default as Entities } from "components/skydeck/entities";
export { default as Source } from "components/skydeck/source";
export { default as Activities } from "components/skydeck/activities";
export { default as Scroll } from "components/skydeck/scroll";

import Member from "components/skydeck/member";

export function addMemberWidget(member, addWidget) {
  addWidget((props) => (
    <Member
      key={member.globalActor}
      title={member.globalActorName}
      member={member}
      {...props}
    />
  ));
}
