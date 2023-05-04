const levels = [
  {
    number: 1,
    name: "Advocates",
    distance: 29,
    multiplier: 1,
    exponent: 1,
    r1: 10,
    r2: 14,
    r3: 20,
    description:
      "Advocates organize and grow the community, building on a base of knowledge and leadership. Advocates create content, give talks, meet with members, and generally leverage their network to help distribute information.",
  },
  {
    number: 2,
    name: "Contributors",
    distance: 51,
    exponent: 2,
    multiplier: 3,
    r1: 6,
    r2: 12,
    r3: 17,
    description:
      "Contributors actively work to help the community reach its goals, and not only for their own personal benefit. They start to build a base of leadership and expertise, while taking on reach-expanding roles like training and mentorship.",
  },
  {
    number: 3,
    name: "Participants",
    distance: 76,
    multiplier: 9,
    r1: 5,
    r2: 8,
    r3: 15,
    exponent: 5,
    description:
      "Participants regularly engage in the community and build connections with other members. They ask questions, attend events, and give feedback.",
  },
  {
    number: 4,
    name: "Explorers",
    distance: 100,
    exponent: 10,
    multiplier: 20,
    description:
      "Explorers are newcomers and passive observers who are primarily interested in getting information and learning. The number of Explorers tends to be large, so it's important to identify the most promising members and start building a relationship. A member's reach outside of the community is a good signal to look at for deciding who to invest in.",
    r1: 4,
    r2: 7,
    r3: 13,
    rxFuzz: 0.1,
    ryFuzz: 0.1,
    positionFuzz: 0.02,
  },
];

export default levels;
