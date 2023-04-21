import { faker } from "@faker-js/faker";
import * as d3 from "d3";

function cyrb128(str) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [
    (h1 ^ h2 ^ h3 ^ h4) >>> 0,
    (h2 ^ h1) >>> 0,
    (h3 ^ h1) >>> 0,
    (h4 ^ h1) >>> 0,
  ];
}

function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const members = function () {
  var number = 50;
  var loveScale = d3.scaleLinear().range([0, 2]).domain([0, 1]);
  var reachScale = d3.scaleLinear().range([0, 2]).domain([0, 1]);
  var levelScale = d3.scaleQuantize().range([1, 2, 3, 4]).domain([0, 1]);
  var array = [];
  var seed = cyrb128("apples");
  var rand = mulberry32(seed[0]);

  for (var i = 0; i < number; i++) {
    array.push({
      name: faker.name.firstName() + " " + faker.name.lastName(),
      orbit: levelScale(rand()),
      love: Math.round(loveScale(rand()) * 10) / 10,
      reach: Math.round(reachScale(rand()) * 10) / 10,
    });
  }
  return array;
};

export default members;
