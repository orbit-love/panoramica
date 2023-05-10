import * as d3 from "d3";
import { faker } from "@faker-js/faker";
import c from "lib/common";

class MemberGenerator {
  constructor({ level, rand }) {
    this.rand = rand;
    this.level = level;

    const {
      rxFuzz = 0.1,
      ryFuzz = 0.1,
      positionFuzz = 0.05,
      r1,
      r2,
      r3,
      l1 = c.indigo900,
      l2 = c.indigo400,
      l3 = c.indigo100,
      exponent = 1,
    } = this.level;

    this.levelDefaults = {
      rxFuzz,
      ryFuzz,
      positionFuzz,
      r1,
      r2,
      r3,
      l1,
      l2,
      l3,
      exponent,
    };

    this.loveScale = d3
      .scalePow()
      .exponent(exponent)
      .range([0, 1])
      .domain([0, 1]);
    this.reachScale = d3
      .scalePow()
      .exponent(exponent)
      .range([0, 1])
      .domain([0, 1]);

    this.loveScale2 = d3.scaleQuantize().range([1, 2, 3]).domain([0, 1]);
    this.reachScale2 = d3.scaleQuantize().range([1, 2, 3]).domain([0, 1]);

    this.planetSizeScale = d3
      .scaleLinear()
      .range([r1, r2, r3])
      .domain([1, 2, 3]);
    this.planetColorScale = d3
      .scaleLinear()
      .domain([1, 2, 3])
      .range([l1, l2, l3]);
  }

  produceMembers({ number }) {
    const positionScale = d3
      .scaleLinear(number)
      .range([0, 1])
      .domain([0, number]);

    var members = [];
    for (var i = 0; i < number; i++) {
      const position = c.fuzz(
        this.rand,
        positionScale(i),
        this.levelDefaults.positionFuzz
      );
      const member = this.produceMember({ position });
      members.push(member);
    }
    return members;
  }

  produceMember({ position = 0, memberAttributes = {} }) {
    var { love, reach, name } = memberAttributes;

    var thisName = name || faker.name.firstName();
    var thisLove = love || this.loveScale2(this.loveScale(this.rand()));
    var thisReach = reach || this.reachScale2(this.reachScale(this.rand()));
    const ofInterest =
      (thisLove === 3 && thisReach === 1) ||
      (thisLove === 1 && thisReach === 3);
    const id = `${c.slugify(thisName)}`;
    var member = {
      id,
      ofInterest,
      position,
      name: thisName,
      love: thisLove,
      reach: thisReach,
      level: this.level,
      rx: c.fuzz(this.rand, this.level.rx, this.levelDefaults.rxFuzz),
      ry: c.fuzz(this.rand, this.level.ry, this.levelDefaults.ryFuzz),
      planetSize: this.planetSizeScale(thisReach),
      planetColor: this.planetColorScale(thisLove),
    };
    return member;
  }
}

export default MemberGenerator;
