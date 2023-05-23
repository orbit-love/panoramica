// given a list of members, generate a set of connections of a
// certain sized, with some members more likely to have more
// connections than others due to some factor (like OL)
class ConnectionGenerator {
  constructor({ members, rand }) {
    this.rand = rand;
    this.members = members;

    // multiple the members into a new array based on OL
    // move logic somewhere later
    this.unpackedMembers = members.getUnpackedMembers({ exponent: 4 });
  }

  // with a small number of advocates / contributors, every relationship
  // gets created and then we move on to the outer levels
  produceConnections({ number }) {
    var connections = new Set();
    var max = this.unpackedMembers.length;
    while (connections.size < number) {
      var member1Index = Math.floor(this.rand() * max);
      var member2Index = Math.floor(this.rand() * max);
      var member1 = this.unpackedMembers[member1Index];
      var member2 = this.unpackedMembers[member2Index];
      if (member1.id !== member2.id) {
        // sort the ids in a way that will avoid two entries in the
        // set for either direction
        const setId = [member1.id, member2.id].sort().join("-");
        connections.add(setId);
        // console.log(`Connection ${member1.id} <> ${member2.id}`);
      }
    }
    console.log("Made " + connections.size + " connections");
    return connections;
  }

  // randomly find other members to be connected to member
  // produceConnections({ member, memberList, connectionCount }) {
  //   const targets = [];
  //   var min = 0,
  //     max = memberList.length;
  //   // multiply the reach by the orbit level
  //   for (var i = 0; i < connectionCount; i++) {
  //     // get a random number
  //     var otherMember = memberList[otherMemberIndex];
  //     if (otherMember && member.id !== otherMember.id) {
  //       targets.push(otherMember.id);
  //     }
  //   }
  //   return targets;
  // }
}

export default ConnectionGenerator;
