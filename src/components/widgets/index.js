// export commonly used components for convenience
export { default as Frame } from "./base/Frame";
export { default as Header } from "./base/Header";
export { default as Channel } from "./Channel";
export { default as Channels } from "./Channels";
export { default as Connection } from "./Connection";
export { default as Conversation } from "./Conversation";
export { default as Home } from "./Home";
export { default as Member } from "./Member";
export { default as Members } from "./Members";
export { default as EditProject } from "./EditProject";
export { default as Assistant } from "./Assistant";
export { default as Search } from "./Search";
export { default as Source } from "./Source";

export { default as components } from "./setup/components";
export { default as tabComponents } from "./setup/tabComponents";

export const storageKey = (project) => `dockview-${project.id}`;
export const loadDefaultLayout = (api) => {
  var homePanel = api.addPanel({
    id: "home",
    component: "Home",
    tabComponent: "Home",
    title: "Home",
  });

  api.addPanel({
    id: "all-activity",
    component: "Source",
    tabComponent: "Source",
    title: "All Activity",
    position: {
      direction: "right",
    },
    params: {
      source: null,
    },
  });

  // set the size of the home panel, give it constraints, and lock it
  homePanel.api.setSize({ width: 275 });
  homePanel.group.api.setConstraints({ minimumWidth: 175, maximumWidth: 250 });
  homePanel.group.locked = true;
};

export const saveLayout = ({ project, containerApi }) => {
  const layout = containerApi.toJSON();
  localStorage.setItem(storageKey(project), JSON.stringify(layout));
};

export const resetLayout = ({ project, containerApi }) => {
  localStorage.removeItem(storageKey(project));
  containerApi.clear();
  loadDefaultLayout(containerApi);
};
