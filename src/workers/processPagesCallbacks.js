import TurndownService from "turndown";

import { callLLM } from "src/integrations/ai/answer";
import { indexQAs } from "src/integrations/typesense/index";
import { prisma } from "src/data/db";

export default {
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
    const llmOutput = await callLLM({
      project,
      promptTemplate: `
        Context: {context}
        You will be given the content of a web page related to the above context.
        Your mission will be to produce a serie of question/answers on the given content.
        Each question-answer should be a self-contained unit of information.
        You are free to ignore the original structure of the original content if it makes sense.
        Questions should be precise, and the answer very concise but complete.
        No useful information on the original page should be lost.
        Your output should be a single JSON that looks like this.
        
        [
          { "q": "What is X", "a": "X is this" }
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
        body: turndownService.turndown(page.body),
      },
      streaming: false,
    });
    try {
      const qas = JSON.parse(llmOutput);
      await indexQAs({ project, qas: qas.map((qa) => ({ ...qa, page })) });
    } catch {
      console.log("LLM didn't produce a usable output");
    }
  },
  onCompleted: (job, returnValue) => {
    console.log(`Job ${job} completed and returned:`);
    console.log(returnValue);
  },
  onFailed: (job, error) => {
    console.error(`Job ${job} failed with the following error:`);
    console.error(error);
  },
};
