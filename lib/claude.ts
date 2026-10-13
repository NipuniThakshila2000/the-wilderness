import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

type AskOptions = {
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
};

export async function askText({ system, prompt, model = "claude-sonnet-5-5", maxTokens = 700 }: AskOptions) {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: 0.7,
    system,
    messages: [{ role: "user", content: prompt }]
  });

  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

export async function askJSON<T>({ system, prompt, model = "claude-haiku-5-5", maxTokens = 900 }: AskOptions): Promise<T> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: 0.2,
    system,
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
  const match = text.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("Claude did not return JSON.");
  }

  return JSON.parse(match[0]) as T;
}
