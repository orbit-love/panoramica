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
    const maxActivityCount = Math.max(
      ...Object.values(this.memo).map((member) => member.activityCount)
    );
    const activityCountScale = d3
      .scaleQuantize()
      .domain([1, maxActivityCount])
      .range([4, 3, 2, 1]);
    this.result = Object.values(this.memo).map((member) => ({
      ...member,
      level: activityCountScale(member.activityCount),
      love: member.activityCount / maxActivityCount,
    }));
  }

  getResult() {
    return this.result;
  }

  logState() {
    Object.entries(this.memo).forEach(console.log);
  }
}
