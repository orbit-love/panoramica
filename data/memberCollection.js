import * as d3 from "d3";

import c from "lib/common";
import MemberGenerator from "data/memberGenerator";
import ConnectionGenerator from "data/connectionGenerator";

class MemberCollection {
  constructor({ levels, rand }) {
    this.levels = levels;
    this.rand = rand;
    this.generators = {};

    // internal array to get the members
    this.list = [];
    // internal set for the connections between members
    this.connections = new Set();

    Object.keys(this.levels).forEach((number) => {
      const level = levels[number];
      this.generators[number] = new MemberGenerator({
        level,
        rand,
      });
    });
  }

  addMembers({ level, number }) {
    const generator = this.generators[level.number];
    this.list.push(...generator.produceMembers({ number }));
  }

  addMember({ level, ...memberAttributes }) {
    const generator = this.generators[level.number];
    this.list.push(generator.produceMember({ ...memberAttributes }));
  }

  find(id) {
    return this.list.find((member) => member.id == id);
  }

  filterMembers({ levelNumber }) {
    return this.list.select((member) => member.level.number === levelNumber);
  }

  // take the OL to the power of exponent for the number of copies
  getUnpackedMembers({ exponent = 2 }) {
    const unpackedMembers = [];
    this.list.forEach((member) => {
      // create 1, 8, 27, 64
      var copies = (5 - member.level.number + 1) ** exponent;
      for (var i = 0; i < copies; i++) {
        unpackedMembers.push(member);
      }
    });
    return unpackedMembers;
  }

  // level is the new level
  changeLevel({ id, levelNumber, love = 1, reach = 1 }) {
    const oldMember = this.find(id);
    const level = this.levels[levelNumber];

    // update the attributes of the old member
    oldMember.level = level;
    oldMember.love = love;
    // todo remove this to be based on connections
    oldMember.reach = reach;

    // indicate to drawMembers that the animation and attributes
    // of this member need to be changed on the next render
    oldMember.reset = true;
  }

  length() {
    return this.list.length;
  }

  generateConnections({ number }) {
    const connectionGenerator = new ConnectionGenerator({
      members: this,
      rand: this.rand,
    });
    this.connections = connectionGenerator.produceConnections({ number });
  }

  // generate the positions along the arc for each members now that we
  // know how many members we have at each level
  // we also need to reorder the underlying list
  assignPositions() {
    const newList = [];
    Object.values(this.levels).forEach((level) => {
      var levelMembers = this.list.filter(
        (member) => member.level.number === level.number
      );
      // sort the members and add to new list
      levelMembers.sort((b, a) => a.love * a.reach - b.love * b.reach);
      newList.push(...levelMembers);
      // now calculate the positions
      const positionScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([0, levelMembers.length]);
      levelMembers.forEach((member, index) => {
        const position = c.fuzz(
          this.rand(),
          positionScale(index),
          level.positionFuzz
        );
        member.position = position;
      });
    });
    this.list = newList;
  }

  assignVisualProperties() {
    Object.values(this.levels).forEach((level) => {
      const {
        r1,
        r2,
        r3,
        l1 = c.indigo800,
        l2 = c.indigo400,
        l3 = c.indigo200,
      } = level;

      const planetSizeScale = d3
        .scaleLinear()
        .range([r1, r2, r3])
        .domain([1, 2, 3]);
      const planetColorScale = d3
        .scaleLinear()
        .domain([1, 2, 3])
        .range([l1, l2, l3]);

      var levelMembers = this.list.filter(
        (member) => member.level.number === level.number
      );
      levelMembers.forEach(function (member) {
        const gravity = love * reach;
        const { name, love, reach } = member;

        const rxSeed = member.rxSeed || this.rand();
        const rySeed = member.rySeed || this.rand();

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
          rxSeed,
          rySeed,
          rx: c.fuzz(rxSeed, level.rx, 0.0),
          ry: c.fuzz(rySeed, level.ry, 0.0),
          planetSize: planetSizeScale(reach),
          planetColor: planetColorScale(love),
        });
      });
    });
  }

  // return the connections for a single member
  getConnections({ member }) {
    const connectedMembers = [];
    this.connections.forEach((idPair) => {
      const [id1, id2] = idPair.split("-");
      if (id1 === member.id) {
        connectedMembers.push(this.find(id2));
      }
      if (id2 === member.id) {
        connectedMembers.push(this.find(id1));
      }
    });
    return connectedMembers;
  }
}

export default MemberCollection;
