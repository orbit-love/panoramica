import * as d3 from "d3";

export default class MemberReducer {
  constructor({}) {
    this.memo = {};
    this.result = null;
  }

  reduce(activity) {
    var { actor, _ } = activity;
    var existingRecord = this.memo[actor];

    var newRecord;
    if (existingRecord) {
      newRecord = {
        ...existingRecord,
        activityCount: existingRecord.activityCount + 1,
      };
    } else {
      newRecord = {
        actor,
        activityCount: 1,
      };
    }

    this.memo[actor] = newRecord;
  }

  finalize() {
    const activityCounts = Object.values(this.memo)
      .map((member) => member.activityCount)
      .sort((a, b) => a - b);
    const maxActivityCount = activityCounts[activityCounts.length - 3];
    const activityCountScale = d3
      .scalePow()
      .exponent(0.1)
      .domain([1, maxActivityCount])
      .range([0, 1]);
    const activityCountScale2 = d3
      .scaleQuantize()
      .domain([0, 1])
      .range([4, 3, 2, 1]);
    this.result = Object.values(this.memo).map((member) => ({
      ...member,
      level: activityCountScale2(activityCountScale(member.activityCount)),
      love: Math.floor((member.activityCount / maxActivityCount) * 100) / 100,
    }));
  }

  getResult() {
    return this.result;
  }

  logState() {
    Object.entries(this.memo).forEach(console.log);
  }
}
