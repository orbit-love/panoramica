import * as d3 from "d3";
import c from "lib/common";

const helper = {
  // update visual properties based on the latest data
  prepareToRender({ members, levels }) {
    var helper = this;

    Object.values(levels).forEach((level) => {
      // get all the members at this level
      var levelMembers = members.filterMembers({ levelNumber: level.number });

      // put the connections in an array as a kind of caching
      levelMembers.forEach((member) => {
        // member.connections = self.getConnections({ member });
        // sort the connections so the highest orbit level ones are on top
        if (member.connections) {
          member.connections.sort((a, b) => a.level - b.level);
        }
      });

      // sort all the members into an array based on number of connection length
      const memberConnections = levelMembers.map(
        (member) => member.connections?.length || 0
      );
      const minConnections = Math.min(...memberConnections);
      const maxConnections = Math.max(...memberConnections);
      // update properties before sorting and calculating positions
      levelMembers.forEach((member) => {
        // assign reach based on connections
        helper.assignReach({ member, level, minConnections, maxConnections });
        // assign visual properties once reach is up to date
        helper.assignVisualProperties({ member, level });
      });
    });
  },

  // assign reach based on looking at the min and max connections
  // in the orbit level and placing the member according to theirs
  assignReach({ member, minConnections, maxConnections }) {
    if (member.connections) {
      // linear scale for reach down to 0-1 so it matches love
      // then we transform both to 1-3 with the same quantize scale
      const reachScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([minConnections, maxConnections]);
      member.reach =
        Math.round(reachScale(member.connections.length) * 100) / 100;
    }
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

    const gravity = love * reach;
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
      gravity,
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
