import c from "lib/common";

const processRow = (record, index) => {
  var a = record.get("a").properties;
  var b = record.get("b").properties;
  var memA = record.get("memA").properties;
  var memB = record.get("memB").properties;

  var obj = [];
  if (index === 0) {
    obj.push({
      messageId: a.id,
      replyToMessageId: null,
      from: memA.globalActorName,
      to: null,
      timestamp: a.timestamp,
      text: a.textHtml,
    });
  }

  obj.push({
    messageId: b.id,
    replyToMessageId: a.id,
    from: memB.globalActorName,
    to: memA.globalActorName,
    text: b.textHtml,
    timestamp: b.timestamp,
  });

  return obj;
};

export const getConversation = async function ({
  projectId,
  conversationId,
  graphConnection,
}) {
  const query = `
    MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]-(c:Activity { id: $conversationId })<-[:REPLIES_TO*0..]-(a:Activity)<-[:REPLIES_TO]-(b:Activity)
      WITH a, b
      MATCH (memA:Member)-[:DID]->(a)
      MATCH (memB:Member)-[:DID]->(b)
      WITH a, b, memA, memB
    ORDER BY a.timestamp
    RETURN a, b, memA, memB;`;

  const { records } = await graphConnection.run(query, {
    projectId,
    conversationId,
  });

  var messages = records.map(processRow).flat();
  return messages;
};
