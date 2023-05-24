import c from "lib/common";

const factor = 22;
const levels = [
  {
    number: 1,
    name: "Advocates",
    nameSingular: "an Advocate",
    distance: 100 - factor * 3,
    multiplier: 1,
    exponent: 1,
    r1: 12,
    r2: 11,
    r3: 10,
    ringColor: c.indigo800,
  },
  {
    number: 2,
    name: "Contributors",
    nameSingular: "a Contributor",
    distance: 100 - factor * 2,
    exponent: 2,
    multiplier: 4,
    r1: 11,
    r2: 10,
    r3: 9,
    ringColor: c.indigo800,
  },
  {
    number: 3,
    name: "Participants",
    nameSingular: "a Participant",
    distance: 100 - factor,
    exponent: 3,
    multiplier: 7,
    r1: 10,
    r2: 9,
    r3: 8,
    ringColor: c.indigo900,
  },
  {
    number: 4,
    name: "Explorers",
    nameSingular: "an Explorer",
    distance: 100,
    exponent: 5,
    multiplier: 13,
    r1: 7,
    r2: 6,
    r3: 5,
    rxFuzz: 0.0,
    ryFuzz: 0.0,
    ringColor: c.indigo900,
  },
];

export default levels;
