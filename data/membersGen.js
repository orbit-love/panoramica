import { faker } from "@faker-js/faker";
import levelsData from "data/levels";
import * as d3 from "d3";
import c from "components/2023/common";

const members = function ({ number = 50 }) {
  var loveScale = d3.scaleLinear().range([0, 2]).domain([0, 1]);
  var reachScale = d3.scaleLinear().range([0, 2]).domain([0, 1]);

  var seed = c.cyrb128("apples");
  faker.seed(seed);
  var rand = c.mulberry32(seed[0]);

  levelsData.forEach((level) => {
    var array = [];
    var memberCount = Math.round(level.memberPercent * number);
    level.memberCount = memberCount;
    for (var i = 0; i < memberCount; i++) {
      array.push({
        name: faker.name.firstName() + " " + faker.name.lastName(),
        orbit: level.number,
        love: Math.round(loveScale(rand()) * 10) / 10,
        reach: Math.round(reachScale(rand()) * 10) / 10,
      });
    }
    level.members = array;
  });

  return levelsData;
};

export default members;
