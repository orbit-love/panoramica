import * as d3 from "d3";
import c from "lib/common";

export default class MemberReducer {
  constructor({}) {
    this.memo = {};
    this.result = null;
  }

  reduce(activity) {
    var { actor, mentions, _ } = activity;
    var existingRecord = this.memo[actor];

    // these are local actor mentions
    var connections = mentions || [];

    var newRecord;
    if (existingRecord) {
      newRecord = {
        ...existingRecord,
        connections: [...existingRecord.connections, ...connections].filter(
          c.onlyUnique
        ),
        activityCount: existingRecord.activityCount + 1,
      };
    } else {
      newRecord = {
        actor,
        connections,
        activityCount: 1,
      };
    }

    this.memo[actor] = newRecord;
  }

  finalize() {
    this.result = [];

    // first, set the OLs
    const activityCounts = Object.values(this.memo)
      .map((member) => member.activityCount)
      .sort((a, b) => a - b);
    // which maximum to pick is tricky, need a better solution here
    const maxActivityCount = activityCounts[activityCounts.length - 2];
    // an exponential scale to make it harder to get to higher OLs
    const activityCountScale = d3
      .scalePow()
      .exponent(0.1)
      .domain([1, maxActivityCount])
      .range([0, 1]);
    // quantize the number into 1-4
    const activityCountScale2 = d3
      .scaleQuantize()
      .domain([0, 1])
      .range([4, 3, 2, 1]);

    Object.values(this.memo).forEach((member) => {
      member.level = activityCountScale2(
        activityCountScale(member.activityCount)
      );
    });

    [1, 2, 3, 4].forEach((levelNumber) => {
      var levelMembers = Object.values(this.memo).filter(
        (member) => member.level === levelNumber
      );

      // get a scale for love within the orbit level
      const activityCounts = levelMembers
        .map((member) => member.activityCount)
        .sort((a, b) => a - b);

      const minActivityCount = activityCounts[0];
      const maxActivityCount = activityCounts[activityCounts.length - 1];
      const loveScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([minActivityCount, maxActivityCount]);

      const memberConnections = levelMembers.map(
        (member) => member.connections?.length || 0
      );
      const minConnections = Math.min(...memberConnections);
      const maxConnections = Math.max(...memberConnections);
      const reachScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([minConnections, maxConnections]);

      levelMembers.forEach((member) => {
        const love = Math.floor(loveScale(member.activityCount) * 10) / 10;
        const reach =
          Math.floor(reachScale(member.connections.length) * 10) / 10;
        this.result.push({
          ...member,
          love,
          reach,
          gravity: love * reach,
        });
      });
    });
    return this.result;
  }

  getResult() {
    return this.result;
  }

  logState() {
    Object.entries(this.memo).forEach(console.log);
  }
}
