const levels = [
  {
    number: 1,
    name: "Advocates",
    distance: 31,
    multiplier: 1,
    exponent: 1,
    r1: 10,
    r2: 14,
    r3: 20,
    description:
      "Advocates help the community mobilize and grow, building social proof and spreading the word. They create content and give talks, leveraging the reach that they have. In product communities, this level includes product ambassadors and champions.",
  },
  {
    number: 2,
    name: "Contributors",
    distance: 53,
    exponent: 2,
    multiplier: 3,
    r1: 6,
    r2: 12,
    r3: 17,
    description:
      "Contributors put some of their time toward helping the community or product reach its goals, not only for their own immediate benefit. In product communities, this level includes contributors of code, templates, documentation, translation, and users who give product feedback and participate in beta groups.",
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
      "Participants regularly engage in the community and build connections with other members. In product communities, this level includes the users of the product.",
  },
  {
    number: 4,
    name: "Explorers",
    distance: 100,
    exponent: 10,
    multiplier: 20,
    description:
      "Explorers are newcomers and passive observers who are primarily interested in getting information and learning.",
    r1: 4,
    r2: 7,
    r3: 13,
    rxFuzz: 0.1,
    ryFuzz: 0.1,
    positionFuzz: 0.02,
  },
];

export default levels;
