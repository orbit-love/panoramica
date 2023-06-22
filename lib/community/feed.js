import c from "lib/common";

const isReply = (thread) => thread.type === "reply";

// threads is a metadata object that looks like
// activity: { members: [], entities [] }
// members and entities are everyone in the thread
// this works for single-message threads too
export default class Feed {
  constructor({ community, selection, connection, entity }) {
    this.community = community;
    this.activities = community.activities;
    this.threads = community.threads;
    this.selection = selection;
    this.connection = connection;
    this.entity = entity;
  }

  getSources({ activities = this.activities }) {
    return activities.map((activity) => activity.source).filter(c.onlyUnique);
  }

  // filter out replies, they will be rendered in threads
  // this does not filter out sources so that a list of sources can be
  // presented for filtering
  getFilteredActivities() {
    var self = this;
    var filteredActivities = this.activities.filter(function (activity) {
      // there is a thread for every activity
      var thread = self.threads[activity.id];

      // filter out any replies (todo on the server)
      if (isReply(thread)) {
        return false;
      }

      var { members, entities } = thread;

      // filter out the activity if it doesn't have an entity
      if (self.entity && entities.indexOf(self.entity.id) === -1) {
        return false;
      }
      // if selection is an orbit level, filter if no members in the thread are in the OL
      if (self.selection?.number) {
        var levelNumber = self.selection.number;
        var anyoneInThisLevel = false;
        for (let memberGlobalActor of members) {
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
        members.indexOf(self.selection.globalActor) === -1
      ) {
        return false;
      }
      if (
        self.connection &&
        members.indexOf(self.connection.globalActor) === -1
      ) {
        return false;
      }
      // if we haven't excluded the activity, we keep it
      return true;
    });

    // sorts by the latest reply in the thread
    // other sorts in the future could be on the top of the thread,
    // the depth, the total messages, etc
    filteredActivities.sort((a, b) => {
      var threadA = self.threads[a.id];
      var threadB = self.threads[b.id];
      var timestampA = threadA?.timestamp || a.timestamp;
      var timestampB = threadB?.timestamp || a.timestamp;
      return new Date(timestampB) - new Date(timestampA);
    });

    return filteredActivities;
  }
}
