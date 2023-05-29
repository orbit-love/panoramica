import * as d3 from "d3";
import { faker } from "@faker-js/faker";
import c from "lib/common";

class MemberGenerator {
  constructor({ level, rand }) {
    this.rand = rand;
    this.level = level;

    this.loveScale = d3
      .scalePow()
      .exponent(c.orbitModel.loveExponent)
      .range([0, 1])
      .domain([0, 1]);
  }

  produceMembers({ number }) {
    var members = [];
    for (var i = 0; i < number; i++) {
      members.push(this.produceMember({}));
    }
    return members;
  }

  produceMember({ name, love, rxSeed, rySeed }) {
    const thisName = name || faker.name.firstName();
    const id = `${c.slugify(thisName)}`;

    const thisLove =
      love || Math.round(this.loveScale(this.rand()) * 100) / 100;
    const thisRxSeed = rxSeed || this.rand();
    const thisRySeed = rySeed || this.rand();

    var member = {
      id,
      level: this.level,
      name: thisName,
      love: thisLove,
      rxSeed: thisRxSeed,
      rySeed: thisRySeed,
    };
    return member;
  }
}

export default MemberGenerator;
