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
    const { rxSeed, rySeed, position } = oldMember;
    const level = this.levels[levelNumber];
    const generator = this.generators[levelNumber];
    const newMember = generator.produceMember({
      love,
      reach,
      rxSeed,
      rySeed,
    });
    const { rx, ry, planetSize, planetColor } = newMember;

    // update the attributes of the old member
    oldMember.level = level;
    oldMember.love = newMember.love;
    oldMember.reach = newMember.reach;
    oldMember.rx = rx;
    oldMember.ry = ry;
    oldMember.planetSize = planetSize;
    oldMember.planetColor = planetColor;
    oldMember.position = position;

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
  assignPositions() {
    Object.values(this.levels).forEach((level) => {
      var levelMembers = this.list.filter(
        (member) => member.level.number === level.number
      );
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
