import TurndownService from "turndown";

import { callLLM } from "src/integrations/ai/answer";
import { indexQAs } from "src/integrations/typesense/index";
import { prisma } from "src/data/db";

const processPagesCallbacks = {
  perform: async (job) => {
    const data = job.data;
    if (!data.projectId || !data.page) {
      return "Invalid data";
    }
    const { page, projectId } = data;

    const project = await prisma.project.findFirst({
      where: { id: projectId },
    });

    if (!project) return "Project not found";

    console.log(`[Worker][ProcessPages] Processing page @ ${page.url}`);

    const turndownService = new TurndownService({ headingStyle: "atx" });
    const body = turndownService.turndown(page.body);
    const bodySize = body.length;
    if (bodySize > 16000) {
      return `[Worker][ProcessPages] Body too big (${bodySize} chars), skipping: ${page.url}`;
    }

    const llmOutput = await callLLM({
      project,
      promptTemplate: `
        Context: {context}
        You will be given the content of a web page related to the above context.
        Your mission will be to produce a serie of question/answers on the given content.
        Each question-answer should be a self-contained unit of information.
        You are free to ignore the structure of the original content if it makes sense.
        Questions should be precise, and the answer complete with a good amount of details including links.
        No useful information on the original page should be lost.
        Your output should be a single JSON that looks like this.

        [
          { "q": "What is X", "a": "X is this" },
          { "q": "How do you achieve Y", "a": "By doing this and that" }
        ]

        The web page:
        {title}
        {body}

        Your JSON (Do not explain your work, just output a valid JSON):
      `,
      promptArgs: {
        description: project.description || "-",
        title: page.title,
        body,
      },
      streaming: false,
    });
    // console.log(
    //   `[Worker][ProcessPages] LLM Output from page @ ${page.url}\n`,
    //   llmOutput
    // );
    if (!llmOutput) {
      return `[Worker][ProcessPages] No LLM Output likely due to rate limiting, skipping: ${page.url}`;
    }
    try {
      const qas = JSON.parse(llmOutput);
      await indexQAs({ project, qas: qas.map((qa) => ({ ...qa, page })) });
      return `[Worker][ProcessPages] Indexed ${qas.length} from page @ ${page.url}`;
    } catch (e) {
      return `[Worker][ProcessPages] LLM didn't produce a valid JSON`;
    }
  },
  onCompleted: (job, returnValue) => {
    console.log(`Job ${job.name} completed and returned:`);
    console.log(returnValue);
  },
  onFailed: (job, error) => {
    console.error(`Job ${job.name} failed with the following error:`);
    console.error(error);
  },
  limiter: {
    max: 3,
    duration: 1000,
  },
};

export default processPagesCallbacks;
