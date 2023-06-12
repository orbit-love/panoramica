import * as d3 from "d3";

const toId = (actor) => actor && `id-${actor.replace(/[^a-z0-9\-]/gi, "")}`;

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
    // hold stats about what's in the graph
    this.stats = [];
    // parse the server result into other objects
    this.parseResult();
  }

  // turns this.result into the other data
  parseResult() {
    const self = this;

    this.members = this.result.members;
    this.activities = this.result.activities;
    this.connections = this.result.connections;
    this.stats = this.result.stats;

    // set an id on each member before doing any operations
    this.members.forEach((member) => {
      member.id = toId(member.globalActor) || toId(member.actor);
    });

    // drop in the connections object and add attributes
    this.members.forEach((member) => {
      member.connections = this.connections[member.globalActor] || [];
      // some members in connections won't have member nodes, so take em out
      member.connectedMembers = Object.keys(member.connections)
        .map((actor) =>
          self.members.find(
            (member) => member.globalActor === actor || member.actor === actor
          )
        )
        .filter((e) => e);
      // set the connection count
      member.connectionCount = member.connectedMembers.length;
    });

    this.computeMemberProperties();
  }

  getActivityDateRange() {
    const { first, last } = this.result.stats.activities;
    return { minDate: first, maxDate: last };
  }

  computeMemberProperties() {
    const community = this;

    // first, set the OLs
    const activityCounts = community.members
      .map((member) => member.activityCount)
      .sort((a, b) => a - b);
    // get the lowest and highest activity counts for segmenting purposes
    const minActivityCount = activityCounts[0];
    // which maximum to pick is tricky, need a better solution here
    const maxActivityCount = activityCounts[activityCounts.length - 1];
    // an exponential scale to make it harder to get to higher OLs
    const activityCountScale = d3
      .scalePow()
      .exponent(0.1)
      .domain([minActivityCount, maxActivityCount])
      .range([0, 1]);
    // quantize the number into 1-4
    const activityCountScale2 = d3
      .scaleQuantize()
      .domain([0, 1])
      .range([4, 3, 2, 1]);

    community.members.forEach((member) => {
      member.level = activityCountScale2(
        activityCountScale(member.activityCount)
      );
    });

    [1, 2, 3, 4].forEach((levelNumber) => {
      var levelMembers = community.members.filter(
        (member) => member.level === levelNumber
      );

      // get a scale for love within the orbit level
      const activityCounts = levelMembers
        .map((member) => member.activityCount)
        .sort((a, b) => a - b);

      // setting to 0 avoids situations where members with fewest activities at the level
      // get a 0 for love
      const minActivityCount = 0; // activityCounts[0];
      const maxActivityCount = activityCounts[activityCounts.length - 1];
      const loveScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([minActivityCount, maxActivityCount]);

      const memberConnections = levelMembers.map(
        (member) => member.connectionCount || 0
      );
      const minConnections = Math.min(...memberConnections);
      const maxConnections = Math.max(...memberConnections);
      const reachScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([minConnections, maxConnections]);

      levelMembers.forEach((member) => {
        const love = Math.floor(loveScale(member.activityCount) * 100) / 100;
        const reach =
          Math.floor(reachScale(member.connectionCount) * 100) / 100;
        const gravity = love * reach;
        Object.assign(member, {
          love,
          reach,
          gravity,
        });
      });
    });
  }

  findMemberById(id) {
    return this.members.find((member) => member.id === id);
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

    this.members = newList;
  }
}
