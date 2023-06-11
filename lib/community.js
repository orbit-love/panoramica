export default class Community {
  constructor({ result, levels }) {
    // result comes from the server
    this.result = result;
    // configuration data for how to apply the simulation visually
    // potentially doesn't live here
    this.levels = levels;
    // internal array to get the members
    this.members = [];
    // internal set for the connections between members
    this.activities = [];
    // internal set for the connections between members
    this.connections = [];
    // parse the server result into other objects
    this.parseResult();
  }

  // turns this.result into the other data
  parseResult() {
    this.members = this.result.members;
    this.activities = this.result.activities;
    this.connections = this.result.connections;
  }

  // get the member with the same actor
  findMemberByActor(activity) {
    this.members.find((member) => member.actor === activity.actor);
  }

  // sort the internal member list by some criteria
  // probably better to do this on the server and remove here
  sortMembers({ sort, levels }) {
    const self = this;
    const newList = [];

    Object.values(levels).forEach((level) => {
      var levelMembers = self.members.filter(
        (member) => member.level === level.number
      );

      // sort the members and add to new list
      switch (sort) {
        case "love":
          levelMembers.sort((b, a) => a.love - b.love);
          break;
        case "reach":
          // sort by connection length here directly since reach is based on that
          levelMembers.sort((b, a) => a.reach - b.reach);
          break;
        case "delta":
          levelMembers.sort(
            (b, a) => Math.abs(a.reach - a.love) - Math.abs(b.reach - b.love)
          );
          break;
        case "gravity":
          levelMembers.sort((b, a) => a.love * a.reach - b.love * b.reach);
          break;
      }
      newList.push(...levelMembers);
    });
    this.list = newList;
  }
}
