import * as d3 from "d3";
import { faker } from "@faker-js/faker";
import c from "lib/common";

class MemberGenerator {
  constructor({ level, rand }) {
    this.rand = rand;
    this.level = level;

    const {
      rxFuzz = 0.0,
      ryFuzz = 0.0,
      positionFuzz = 0.0,
      r1,
      r2,
      r3,
      l1 = c.indigo800,
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
        this.rand(),
        positionScale(i),
        this.levelDefaults.positionFuzz
      );
      const member = this.produceMember({ position });
      members.push(member);
    }
    return members;
  }

  produceMember({ name, love, reach, rxSeed, rySeed, position = 0 }) {
    const thisName = name || faker.name.firstName();
    const id = `${c.slugify(thisName)}`;

    const thisLove = love || this.loveScale2(this.loveScale(this.rand()));
    const thisReach = reach || this.reachScale2(this.reachScale(this.rand()));
    const gravity = thisLove * thisReach;

    const ofInterest =
      (thisLove === 3 && thisReach === 1) ||
      (thisLove === 1 && thisReach === 3);
    const thisRxSeed = rxSeed || this.rand();
    const thisRySeed = rySeed || this.rand();

    var summary;
    if (thisLove === 3 && (thisReach === 1 || thisReach === 2)) {
      summary = `has high love and low/medium reach relative to others in their orbit level. Help ${thisName} meet other members and grow their network.`;
    }
    if (thisReach === 3 && (thisLove === 1 || thisLove === 2)) {
      summary = `has high reach and low/medium love relative to others in their orbit level. Help ${thisName} find deeper and more frequent ways to contribute.`;
    }
    if (thisReach !== 3 && thisLove !== 3) {
      summary = `has balanced love and reach relative to others in their orbit level. Continue to offer deeper ways to contribute and connect with other members.`;
    }
    if (thisReach === 3 && thisLove === 3) {
      summary = `has high reach and high love relative to others in their orbit level. Think about what ${thisName} might need to reach the next level.`;
    }
    summary = `${thisName} is ${this.level.nameSingular} and ${summary}`;

    var member = {
      id,
      ofInterest,
      position,
      summary,
      rxSeed: thisRxSeed,
      rySeed: thisRySeed,
      name: thisName,
      love: thisLove,
      reach: thisReach,
      gravity,
      level: this.level,
      rx: c.fuzz(thisRxSeed, this.level.rx, this.levelDefaults.rxFuzz),
      ry: c.fuzz(thisRySeed, this.level.ry, this.levelDefaults.ryFuzz),
      planetSize: this.planetSizeScale(thisReach),
      planetColor: this.planetColorScale(thisLove),
    };
    return member;
  }
}

export default MemberGenerator;
