import React from "react";

export { default as Home } from "components/skydeck/home";
export { default as Project } from "components/skydeck/project";
export { default as Frame } from "components/skydeck/frame";
export { default as Header } from "components/skydeck/header";
export { default as Entity } from "components/skydeck/entity";
export { default as Member } from "components/skydeck/member";
export { default as Members } from "components/skydeck/members";
export { default as Entities } from "components/skydeck/entities";
export { default as Source } from "components/skydeck/source";
export { default as Channel } from "components/skydeck/channel";
export { default as Search } from "components/skydeck/search";
export { default as Activities } from "components/skydeck/activities";
export { default as Scroll } from "components/skydeck/scroll";
export { default as Connection } from "components/skydeck/connection";
export { default as Insights } from "components/skydeck/insights";
export { default as Prompt } from "components/skydeck/prompt";
export { default as Channels } from "components/skydeck/channels";
export { default as Conversation } from "components/skydeck/conversation";

import Member from "components/skydeck/member";
import Entity from "components/skydeck/entity";
import Channel from "components/skydeck/channel";
import Channels from "components/skydeck/channels";
import Conversation from "components/skydeck/conversation";

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

export function addEntityWidget(entity, addWidget) {
  addWidget((props) => (
    <Entity key={entity.id} title={entity.id} entity={entity} {...props} />
  ));
}

export function addChannelWidget(source, sourceChannel, addWidget) {
  addWidget((props) => (
    <Channel
      key={sourceChannel}
      source={source}
      sourceChannel={sourceChannel}
      {...props}
    />
  ));
}

export function addConversationWidget(activity, addWidget) {
  addWidget((props) => (
    <Conversation key={activity.id} activity={activity} {...props} />
  ));
}

export function addChannelsWidget(source, addWidget) {
  addWidget((props) => <Channels key={source} source={source} {...props} />);
}

export const clickHandlers = (addWidget) => ({
  onClickMember: (member) => addMemberWidget(member, addWidget),
  onClickChannel: (source, sourceChannel) =>
    addChannelWidget(source, sourceChannel, addWidget),
  onClickEntity: (entity) => addEntityWidget(entity, addWidget),
  onClickChannels: (source) => addChannelsWidget(source, addWidget),
  onClickConversation: (activity) => addConversationWidget(activity, addWidget),
});
