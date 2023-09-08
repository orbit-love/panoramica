import { prisma } from "src/data/db";
import { callLLM } from "src/integrations/ai/answer";
import { indexQAs } from "src/integrations/typesense";

const markdownToQasCallbacks = {
  perform: async (job) => {
    const data = job.data;
    if (!data) return "No data found";
    const { projectId, markdown, sourceName, type, reference } = data;
    if (!projectId || !markdown || !sourceName || !reference || !type) {
      return "Invalid Data";
    }

    const project = await prisma.project.findFirst({
      where: { id: data.projectId },
    });

    if (!project) return "Project not found";

    if (markdown.length > 16000) {
      // TODO: Split markdown in 2 smaller chunks and send each part as new job of the same queue.
      // Preferably right before the biggest title close to the middle of the doc.
      return `[Worker][MarkdownToQas] Body too big (${markdown.length} chars), skipping: ${reference.url}`;
    }

    const contentOrigin = {
      web: "web page",
      markdown: "markdown",
      conversations: "conversation",
    }[type];

    const llmOutput = await callLLM({
      project,
      promptTemplate: `
        Context: {context}
        You will be given the content of a {contentOrigin} related to the above context.
        Your mission will be to produce a serie of question/answers on the given content.
        Each question-answer should be a self-contained unit of information.
        You are free to ignore the structure of the original content if it makes sense.
        Questions should be precise, and the answer complete with a good amount of details including links.
        The goal of the generated QAs is to help people better understand the underlying product or tool.
        No useful product or technical information on the original content should be lost.
        Your output should be a single JSON that looks like this.

        [
          { "q": "What is X", "a": "X is this" },
          { "q": "How do you achieve Y", "a": "By doing this and that" }
        ]

        The content:
        {content}

        Your JSON (Do not explain your work, just output a valid JSON):
      `,
      promptArgs: {
        contentOrigin,
        context: project.description || "-",
        content: markdown,
      },
      streaming: false,
    });
    const refString = JSON.stringify(reference);
    console.log(
      `[Worker][MarkdownToQas] LLM Output from ref @ ${refString}\n`,
      llmOutput
    );
    if (!llmOutput) {
      return `[Worker][MarkdownToQas] No LLM Output likely due to rate limiting, skipping ref: ${refString}`;
    }
    let qas;
    try {
      qas = JSON.parse(llmOutput);
    } catch (e) {
      return `[Worker][MarkdownToQas] LLM didn't produce a valid JSON`;
    }

    await indexQAs({
      project,
      qas: qas.map((qa) => ({
        type,
        question: qa.q,
        answer: qa.a,
        source_name: sourceName,
        reference_id: reference.id,
        reference_url: reference.url,
        reference_title: reference.title,
        reference_timestamp: reference.timestamp,
      })),
    });
  },
  onCompleted: (job, returnValue) => {
    console.log(`Job ${job.name} completed and returned:`);
    console.log(returnValue);
  },
  onFailed: (job, error) => {
    console.error(`Job ${job.name} failed with the following error:`);
    console.error(error);
  },
};

export default markdownToQasCallbacks;
