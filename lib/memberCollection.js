import * as d3 from "d3";

import c from "lib/common";
import MemberGenerator from "lib/memberGenerator";
import ConnectionGenerator from "lib/connectionGenerator";

class MemberCollection {
  constructor({ levels, rand }) {
    this.levels = levels;
    this.rand = rand;
    this.generators = {};

    // internal array to get the members
    this.list = [];
    // internal set for the connections between members
    this.connections = new Set();

    // prepare the member generators
    Object.keys(this.levels).forEach((number) => {
      const level = levels[number];
      this.generators[number] = new MemberGenerator({
        level,
        rand,
      });
    });

    // prepare the connection generator
    this.connectionGenerator = new ConnectionGenerator({
      members: this,
      rand: rand,
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
    return this.list.filter((member) => member.level.number === levelNumber);
  }

  // take the OL to the power of exponent for the number of copies
  getUnpackedMembers() {
    const unpackedMembers = [];
    this.list.forEach((member) => {
      // create 1, 8, 27, 64
      var copies = member.level.exponent;
      for (var i = 0; i < copies; i++) {
        unpackedMembers.push(member);
      }
    });
    return unpackedMembers;
  }

  // level is the new level
  changeLevel({ id, levelNumber, love = 1 }) {
    const member = this.find(id);
    const level = this.levels[levelNumber];

    // update the attributes of the old member
    member.level = level;
    member.love = love;

    // indicate to drawMembers that the animation and attributes
    // of this member need to be changed on the next render
    member.reset = true;
  }

  length() {
    return this.list.length;
  }

  generateConnections({ number }) {
    this.connections = this.connectionGenerator.produceConnections({ number });
  }

  // update visual properties based on the latest data
  // for the member
  prepareToRender({ sort }) {
    var self = this;

    const newList = [];
    Object.values(this.levels).forEach((level) => {
      // get all the members at this level
      var levelMembers = this.filterMembers({ levelNumber: level.number });

      // put the connections in an array as a kind of caching
      levelMembers.forEach((member) => {
        member.connections = self.getConnections({ member });
        // sort the connections so the highest orbit level ones are on top
        member.connections.sort((a, b) => a.level.number - b.level.number);
      });

      // sort all the members into an array based on number of connection length
      const memberConnections = levelMembers.map(
        (member) => member.connections.length || 0
      );
      const minConnections = Math.min(...memberConnections);
      const maxConnections = Math.max(...memberConnections);
      // update properties before sorting and calculating positions
      levelMembers.forEach((member) => {
        // assign reach based on connections
        this.assignReach({ member, level, minConnections, maxConnections });
        // assign visual properties once reach is up to date
        this.assignVisualProperties({ member, level });
      });
      // sort the members and add to new list
      switch (sort) {
        case "love":
          levelMembers.sort((b, a) => a.love - b.love);
          break;
        case "reach":
          // sort by connection length here directly since reach is based on that
          levelMembers.sort(
            (b, a) => a.connections.length - b.connections.length
          );
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

  // assign reach based on looking at the min and max connections
  // in the orbit level and placing the member according to theirs
  assignReach({ member, minConnections, maxConnections }) {
    const reachScale = d3
      .scaleQuantize()
      .range([1, 2, 3])
      .domain([minConnections, maxConnections]);
    member.reach = reachScale(member.connections.length);
  }

  assignVisualProperties({ member, level }) {
    const {
      r1,
      r2,
      r3,
      l1 = c.indigo900,
      l2 = c.indigo500,
      l3 = c.indigo300,
    } = level;

    const planetSizeScale = d3
      .scaleLinear()
      .range([r1, r2, r3])
      .domain([1, 2, 3]);
    const planetColorScale = d3
      .scaleLinear()
      .domain([1, 2, 3])
      .range([l1, l2, l3]);

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
  }

  getConnectionSetKeys(member) {
    const setKeys = [];
    this.connections.forEach((setKey) => {
      const [id1, id2] = setKey.split("-");
      if (id1 === member.id || id2 === member.id) {
        setKeys.push(setKey);
      }
    });
    return setKeys;
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
