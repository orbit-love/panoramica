import c from "lib/common";

const isReply = (activity) => Boolean(activity.parent);

// threads is a metadata object that looks like
// activity: { members: [], entities [] }
// members and entities are everyone in the thread
// this works for single-message threads too
export default class Feed {
  constructor({ community, selection, connection, entity }) {
    this.activities = community.activities;
    this.threads = community.threads;
    this.selection = selection;
    this.connection = connection;
    this.entity = entity;
  }

  // filter out replies, they will be rendered in threads
  getFilteredActivities() {
    var self = this;
    return this.activities.filter(function (activity) {
      // filter out any replies (todo on the server)
      if (isReply(activity)) {
        return false;
      }

      // there is a thread for every activity
      var { members, entities } = self.threads[activity.id];

      // filter out the activity if it doesn't have an entity
      if (self.entity && entities.indexOf(self.entity) === -1) {
        return false;
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
  }
}
