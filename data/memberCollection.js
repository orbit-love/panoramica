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
      members: this.list,
      rand: this.rand,
    });
    this.connections = connectionGenerator.produceConnections({ number });
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
