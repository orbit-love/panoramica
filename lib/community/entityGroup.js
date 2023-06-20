import c from "lib/common";

export default class EntityGroup {
  constructor({ community, selection, connection, entity }) {
    this.community = community;
    this.entities = community.entities;
    this.selection = selection;
    this.connection = connection;
    this.entity = entity;
  }

  // filter out replies, they will be rendered in threads
  getFilteredEntities() {
    var self = this;
    var entitiesArray = Object.values(this.entities);
    return entitiesArray.filter(function (entity) {
      // if selection is an orbit level, filter if no members in the thread are in the OL
      if (self.selection?.number) {
        var levelNumber = self.selection.number;
        var anyoneInThisLevel = false;
        for (let memberGlobalActor of entity.members) {
          var member = self.community.findMemberByActor(memberGlobalActor);
          if (member?.level === levelNumber) {
            anyoneInThisLevel = true;
          }
        }
        if (!anyoneInThisLevel) {
          return false;
        }
      }
      // filter out the activity if it doesn't have either selection or connection
      if (
        self.selection?.globalActor &&
        entity.members.indexOf(self.selection.globalActor) === -1
      ) {
        return false;
      }
      if (
        self.connection &&
        entity.members.indexOf(self.connection.globalActor) === -1
      ) {
        return false;
      }
      // if we haven't excluded the activity, we keep it
      return true;
    });
  }
}
