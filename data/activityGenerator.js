import * as d3 from "d3";
import { faker } from "@faker-js/faker";
import c from "lib/common";

import MemberGeneratorLight from "data/memberGeneratorLight";
import activityTypes from "data/activityTypes";

class Activity {
  constructor({ member, activityType, links, timestamp, properties = {} }) {
    this.member = member;
    this.activityType = activityType;
    // the existing community members from which to add links
    this.links = links;
    this.timestamp = timestamp;
    this.properties = properties;
  }
}

//
class ActivityGenerator {
  constructor({ rand, members, levels, options = {} }) {
    // a seed for randomization
    this.rand = rand;
    // the available orbit levels
    this.levels = levels;
    // the existing community members from which to add links
    this.members = members;
    this.options = options;

    // in case we need to generate a new member to do an activity
    this.memberGenerator = new MemberGeneratorLight({ levels });

    // create copies from which to sample
    this.unpackedMembers = members;
  }

  randomMember() {
    var max = this.unpackedMembers.length;
    var index = Math.floor(this.rand() * max);
    return this.unpackedMembers[index];
  }

  // length = 4
  // math.floor(0.6 * 4 + 0)
  randomActivityType() {
    var max = activityTypes.length;
    var index = Math.floor(this.rand() * max);
    return activityTypes[index];
  }

  generateNewMember() {}

  // produce an activity - for now with no links, the type
  // at random, and a member
  produceActivity({}) {
    const timestamp = new Date();
    // no links for now
    const links = {};
    // no props for now
    const properties = {};

    // in the future, get the type and then try to find members
    // based on simulation metadata
    const activityType = this.randomActivityType();
    // eventually this is a function of the activity type
    const member = this.randomMember();

    return new Activity({
      member,
      activityType,
      links,
      timestamp,
      properties,
    });
  }
}

export default ActivityGenerator;
