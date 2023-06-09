import * as d3 from "d3";
import c from "lib/common";

const helper = {
  // update visual properties based on the latest data
  prepareToRender({ members, levels }) {
    var helper = this;

    var result = [];

    Object.values(levels).forEach((level) => {
      // get all the members at this level
      var levelMembers = members.list.filter(
        (member) => member.level === level.number
      );

      levelMembers.forEach((existingMember) => {
        var member = { ...existingMember };
        helper.assignVisualProperties({ member, level });
        result.push(member);
      });
    });

    return result;
  },

  assignVisualProperties({ member, level }) {
    const {
      radius,
      l1 = c.orbitModel.planetColors[1],
      l2 = c.orbitModel.planetColors[2],
      l3 = c.orbitModel.planetColors[3],
    } = level;

    const planetColorScale = d3
      .scaleQuantize()
      .domain([0, 1])
      .range([l1, l2, l3]);

    const { name, love, reach } = member;

    // const rxSeed = member.rxSeed || this.rand();
    // const rySeed = member.rySeed || this.rand();

    var summary;
    if (love === 3 && (reach === 1 || reach === 2)) {
      summary = `has high love and low/medium reach relative to others in their orbit level. Help ${name} meet other members and grow their network.`;
    }
    if (reach === 3 && (love === 1 || love === 2)) {
      summary = `has high reach and low/medium love relative to others in their orbit level. Help ${name} find deeper and more frequent ways to contribute.`;
    }
    if (reach !== 3 && love !== 3) {
      summary = `has balanced love and reach relative to others in their orbit level. Continue to offer deeper ways to contribute and connect with other members.`;
    }
    if (reach === 3 && love === 3) {
      summary = `has high reach and high love relative to others in their orbit level. Think about what ${name} might need to reach the next level.`;
    }
    summary = `${name} is ${level.nameSingular} and ${summary}`;

    Object.assign(member, {
      summary,
      // rxSeed,
      // rySeed,
      rx: level.rx,
      ry: level.ry,
      planetSize: radius,
      planetColor: planetColorScale(love),
    });
  },
};

export default helper;
