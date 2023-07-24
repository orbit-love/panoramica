export const addWidget =
  ({ containerApi }) =>
  (id, component, params = {}) => {
    var panel = containerApi.getPanel(id);
    if (panel) {
      panel.api.setActive();
    } else {
      // lift title and position, tabComponent out for now
      var title = params.title || component.name;
      var tabComponent = params.tabComponent || component;
      var position = params.position;
      containerApi.addPanel({
        id,
        component,
        tabComponent,
        position,
        params,
        title,
      });
    }
  };

export function addMemberWidget(member, addWidget, options = {}) {
  addWidget(`member-${member.globalActor}`, "Member", {
    member,
    title: member.globalActorName,
    ...options,
  });
}

export function addConnectionWidget(
  member,
  connection,
  addWidget,
  options = {}
) {
  var title = `${member.globalActorName} - ${connection.globalActorName}`;
  addWidget(
    `connection-${member.globalActor}-${connection.globalActor}`,
    "Connection",
    {
      member,
      connection,
      title,
      ...options,
    }
  );
}

export function addSourceWidget(source, addWidget, options = {}) {
  addWidget(source ? `source-${source}` : "all-activity", "Source", {
    source,
    title: source ? utils.titleize(source) : "All Activity",
    ...options,
  });
}

export function addChannelWidget(
  source,
  sourceChannel,
  addWidget,
  options = {}
) {
  addWidget(`channel-${source}-${sourceChannel}`, "Channel", {
    source,
    sourceChannel,
    title: utils.displayChannel(sourceChannel),
    tabComponent: "Source",
    ...options,
  });
}

export function addChannelsWidget(source, addWidget, options = {}) {
  addWidget(`channels-${source}`, "Channels", {
    source,
    title: "Channels",
    tabComponent: "Source",
    ...options,
  });
}

export function addActivityWidget(activity, addWidget, options = {}) {
  addWidget(`activity-${activity.id}`, "Conversation", {
    activity,
    title: activity.summary || "...",
    ...options,
  });
}
