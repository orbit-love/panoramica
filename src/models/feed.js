import c from "lib/common";

const isReply = (thread) => thread.type === "reply";

// threads is a metadata object that looks like
// activity: { members: [], entities [] }
// members and entities are everyone in the thread
// this works for single-message threads too
export default class Feed {
  constructor({
    community,
    member,
    connection,
    entity,
    source,
    sourceChannel,
  }) {
    this.community = community;
    this.activities = community.activities;
    this.threads = community.threads;
    this.member = member;
    this.connection = connection;
    this.entity = entity;
    this.source = source;
    this.sourceChannel = sourceChannel;
  }

  getSources({ activities = this.activities }) {
    return activities
      .map((activity) => activity.source)
      .filter(c.onlyUnique)
      .filter((s) => s)
      .sort();
  }

  getSourceChannels({ source, activities = this.activities }) {
    return activities
      .filter((activity) => source === activity.source)
      .map((activity) => activity.sourceChannel)
      .filter((c) => c)
      .filter(c.onlyUnique)
      .sort((a, b) => c.displayChannel(a) - c.displayChannel(b));
  }

  // this does not filter out sources so that a list of sources can be
  // presented for filtering
  getFilteredActivities() {
    var self = this;
    var filteredActivities = this.activities.filter(function (activity) {
      // there is a thread for every activity
      var thread = self.threads[activity.id];

      // filter out replies, they will be rendered in threads
      if (isReply(thread)) {
        return false;
      }

      var { members, entities } = thread;

      // filter out the activity if it doesn't have an entity
      if (self.entity && entities.indexOf(self.entity.id) === -1) {
        return false;
      }
      // filter out the activity if it doesn't have either member or connection
      if (self.member && members.indexOf(self.member.globalActor) === -1) {
        return false;
      }
      if (
        self.connection &&
        members.indexOf(self.connection.globalActor) === -1
      ) {
        return false;
      }
      // filter out based on source
      if (self.source && activity.source !== self.source) {
        return false;
      }
      // filter out based on sourceChannel
      if (self.sourceChannel && activity.sourceChannel !== self.sourceChannel) {
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
