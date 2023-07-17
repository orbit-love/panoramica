const toId = (actor) => actor && `id-${actor.replace(/[^a-z0-9\-]/gi, "")}`;

export default class Community {
  constructor({ result }) {
    // result comes from the server
    this.result = result;
    // internal array to get the members
    this.members = [];
    // internal set for activities
    this.activities = [];
    // internal set for threads
    this.threads = [];
    // internal set for the connections between members
    this.connections = [];
    // parse the server result into other objects
    this.parseResult();
  }

  // turns this.result into the other data
  parseResult() {
    const self = this;

    this.members = this.result.members;
    this.activities = this.result.activities;
    this.threads = this.result.threads;
    this.connections = this.result.connections;

    // set an id on each member before doing any operations
    this.members.forEach((member) => {
      member.id = toId(member.globalActor) || toId(member.actor);
    });

    // drop in the connections object and add attributes
    this.members.forEach((member) => {
      member.connections = this.connections[member.globalActor] || [];
      // some members in connections won't have member nodes, so take em out
      member.connectedMembers = Object.keys(member.connections)
        .map(
          (actor) =>
            self.members.find(
              (member) => member.globalActor === actor || member.actor === actor
            )?.id
        )
        .filter((e) => e);
      // set the connection count
      member.connectionCount = member.connectedMembers.length;
    });
  }

  getConnectionCount() {
    const set = new Set();
    for (let member of this.members) {
      for (let connection of member.connectedMembers) {
        set.add(
          [member.globalActor, connection.globalActor].sort().join("---")
        );
      }
    }
    return set.size;
  }

  findMemberById(id) {
    return this.members.find((member) => member.id === id);
  }

  findActivityById(id) {
    return this.activities.find((activity) => activity.id === id);
  }

  findMemberByActor(actor) {
    return this.members.find(
      (member) => member.globalActor === actor || member.actor === actor
    );
  }

  // get the member with the same actor
  findMemberByActivity(activity) {
    return this.members.find(
      (member) =>
        member.globalActor === activity.globalActor ||
        member.actor === activity.actor
    );
  }

  // todo noop for now
  sortMembers({ sort }) {
    return this.members;
  }
}
