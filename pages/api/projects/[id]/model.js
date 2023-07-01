import { OpenAI } from "langchain/llms/openai";
import { check, redirect, authorizeProject } from "lib/auth";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;
  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return;
    }

    const model = new OpenAI({ temperature: 0.9 });
    const modelResponse = await model.call(
      "What would be a good company name a company that makes colorful socks?"
    );

    res.status(200).json({ result: modelResponse });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
