import * as d3 from "d3";
import MemberGenerator from "data/memberGenerator";

class MemberCollection {
  constructor({ levels, rand }) {
    this.levels = levels;
    this.rand = rand;
    this.generators = {};

    // internal array to get the members
    this.list = [];

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
    const level = this.levels[levelNumber];
    const generator = this.generators[levelNumber];
    const newMember = generator.produceMember({
      love,
      reach,
      position: 0,
    });
    const { rx, ry, planetSize, planetColor, position } = newMember;

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
}

export default MemberCollection;
