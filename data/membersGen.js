import { faker } from "@faker-js/faker";
import c from "lib/common";
import levelsData from "data/levels";
import * as d3 from "d3";

// generate members for a specific orbit level
// number is how many members
const members = function ({ number, seed, rand, orbit }) {
  const levelData = levelsData[orbit.number - 1];
  const {
    rxFuzz = 0.1,
    ryFuzz = 0.1,
    positionFuzz = 0.05,
    r1,
    r2,
    r3,
    l1 = "#312e81",
    l2 = "#6366f1",
    l3 = "#c7d2fe",
    exponent = 1,
  } = levelData;

  var loveScale = d3.scalePow().exponent(exponent).range([0, 1]).domain([0, 1]);
  var reachScale = d3
    .scalePow()
    .exponent(exponent)
    .range([0, 1])
    .domain([0, 1]);

  var loveScale2 = d3.scaleQuantize().range([1, 2, 3]).domain([0, 1]);
  var reachScale2 = d3.scaleQuantize().range([1, 2, 3]).domain([0, 1]);

  var array = [];
  var memberCount = Math.round(levelData.multiplier * number);

  const positionScale = d3.scaleLinear().range([0, 1]).domain([0, memberCount]);
  const planetSizeScale = d3
    .scaleLinear()
    .range([r1, r2, r3])
    .domain([1, 2, 3]);
  const planetColorScale = d3
    .scaleLinear()
    .domain([1, 2, 3])
    .range([l1, l2, l3]);

  for (var i = 0; i < memberCount; i++) {
    const name = faker.name.firstName() + " " + faker.name.lastName();
    const love = loveScale2(loveScale(rand()));
    const reach = reachScale2(reachScale(rand()));
    const ofInterest =
      (love === 3 && reach === 1) || (love === 1 && reach === 3);
    var description = null;
    if (love === 3 && reach === 1) {
      description =
        "This member has high love and low reach. Focus on increasing their reach to boost gravity.";
    }
    if (love === 1 && reach === 3) {
      description =
        "This member has high reach and low love. Focus on increasing their love to boost their gravity.";
    }
    var member = {
      i,
      orbit,
      name,
      love,
      reach,
      ofInterest,
      description,
      fontSize: 14,
      level: levelData.number,
      rx: c.fuzz(rand, orbit.rx, rxFuzz),
      ry: c.fuzz(rand, orbit.ry, ryFuzz),
      position: c.fuzz(rand, positionScale(i), positionFuzz),
      planetSize: planetSizeScale(reach),
      planetColor: planetColorScale(love),
      initials: c.initials(name),
    };
    array.push(member);
  }
  // array = array.sort(function (a, b) {
  //   return a.reach - b.reach;
  // });

  return array;
};

export default members;
