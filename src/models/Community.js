import c from "src/configuration/common";

/* holds the data for the community */
export default class Community {
  constructor({ result }) {
    this.result = result;

    this.members = this.result.members;
    this.activities = this.result.activities;
    this.conversations = this.result.conversations;
    this.connections = this.result.connections;
  }

  findActivityById(id) {
    return this.activities.find((activity) => activity.id === id);
  }

  findMemberByGlobalActor(globalActor) {
    return this.members.find((member) => member.globalActor === globalActor);
  }

  // get the member with the same actor
  findMemberByActivity(activity) {
    return this.members.find(
      (member) => member.globalActor === activity.globalActor
    );
  }

  findConnections(member) {
    return this.connections[member.globalActor];
  }

  getSources({ activities = this.activities }) {
    return activities
      .map((activity) => activity.source)
      .filter(c.onlyUnique)
      .filter((s) => s)
      .sort();
  }

  getSourceChannels({ source, activities = this.activities }) {
    return activities
      .filter((activity) => source === activity.source)
      .map((activity) => activity.sourceChannel)
      .filter((c) => c)
      .filter(c.onlyUnique)
      .sort((a, b) => c.displayChannel(a) - c.displayChannel(b));
  }
}
