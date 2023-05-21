import { faker } from "@faker-js/faker";
import c from "lib/common";

// seed faker beforehand for predictability
class MemberGeneratorLight {
  constructor({ levels }) {
    this.levels = levels;
  }

  produceMembers({ number }) {
    var members = [];
    for (var i = 0; i < number; i++) {
      const member = this.produceMember({});
      members.push(member);
    }
    return members;
  }

  produceMember({ name }) {
    const thisName = name || faker.name.firstName();
    const id = `${c.slugify(thisName)}`;

    var member = {
      id,
      name: thisName,
    };
    return member;
  }
}

export default MemberGeneratorLight;
