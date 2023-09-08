import utils from "src/utils";

const defaultTransformActivity = (activity, parentActivity, member) => {
  return {
    messageId: activity.id,
    replyToMessageId: parentActivity?.id,
    author: member.globalActorName,
    timestamp: activity.timestamp,
    text: utils.stripHtmlTags(a.textHtml),
  };
};

const processRow = (record, index, transformActivity) => {
  var a = record.get("a").properties;
  var b = record.get("b")?.properties;
  var memA = record.get("memA").properties;
  var memB = record.get("memB")?.properties;

  var obj = [];
  if (index === 0) {
    obj.push(transformActivity(a, null, memA));
  }

  if (b) {
    // if the ids are the same, it's because there is just 1 message in
    // the conversation, so don't add another row
    if (a.id !== b.id) {
      obj.push(transformActivity(b, a, memB));
    }
  }

  return obj;
};

export const getConversation = async function ({
  projectId,
  conversationId,
  graphConnection,
  transformActivity = defaultTransformActivity,
}) {
  // this is what we account for here:
  // - single-message conversations return a but not b, hence the optional matches
  // - all levels of replies are returned
  const query = `
    MATCH (p:Project { id: $projectId })
    WITH p
      MATCH (p)-[:OWNS]-(a:Activity { conversationId: $conversationId })
       OPTIONAL MATCH (a)<-[:REPLIES_TO]-(b:Activity)
      WITH a, b
      MATCH (memA:Member)-[:DID]->(a)
      OPTIONAL MATCH (memB:Member)-[:DID]->(b)
      WITH a, b, memA, memB
    ORDER BY a.timestamp, b.timestamp
    RETURN a, b, memA, memB;`;

  const { records } = await graphConnection.run(query, {
    projectId,
    conversationId,
  });

  var messages = records
    .map((record, index) => processRow(record, index, transformActivity))
    .flat();
  return messages;
};
