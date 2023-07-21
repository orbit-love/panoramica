/* holds the data for the community */
export default class Community {
  constructor({ result }) {
    this.result = result;

    this.members = this.result.members;
    this.activities = this.result.activities;
    this.threads = this.result.threads;
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
}
