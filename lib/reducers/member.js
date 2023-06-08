import * as d3 from "d3";
import c from "lib/common";

const mentions = function (tweet) {
  return tweet?.entities?.mentions || tweet?.entities?.user_mentions || [];
};

export default class MemberReducer {
  constructor({}) {
    this.memo = {};
    this.result = null;
  }

  reduce(activity) {
    var { actor, _ } = activity;
    var existingRecord = this.memo[actor];

    var connections = [];
    const tw = activity.payload.attributes.t_tweet;
    if (tw) {
      connections = mentions(tw).map(
        (mention) => mention.username || mention.screen_name
      );
    }

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

    // set the OLs
    const activityCounts = Object.values(this.memo)
      .map((member) => member.activityCount)
      .sort((a, b) => a - b);
    // which maximum to pick is tricky, need a better solution here
    const maxActivityCount = activityCounts[activityCounts.length - 2];
    const activityCountScale = d3
      .scalePow()
      .exponent(0.1)
      .domain([1, maxActivityCount])
      .range([0, 1]);
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
      // make higher OLs dimmer, hacky
      const maxActivityCount =
        (activityCounts[activityCounts.length - 1] * levelNumber) / 2;

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
        const love =
          Math.floor((member.activityCount / maxActivityCount) * 100) / 100;
        const reach =
          Math.round(reachScale(member.connections.length) * 100) / 100;
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
