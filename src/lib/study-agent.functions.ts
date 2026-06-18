import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const StudyPackSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  flashcards: z.array(z.object({ q: z.string(), a: z.string() })),
  mcqs: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      answerIndex: z.number(),
      explanation: z.string(),
    }),
  ),
  mindmap: z.object({
    root: z.string(),
    branches: z.array(
      z.object({
        label: z.string(),
        children: z.array(z.string()),
      }),
    ),
  }),
  slides: z.array(
    z.object({
      title: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
});

export type StudyPack = z.infer<typeof StudyPackSchema>;

const InputSchema = z.object({
  text: z.string().min(50).max(120000),
  filename: z.string().optional(),
});

function extractJson(raw: string): unknown {
  let s = raw.trim();
  // strip markdown fences
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
  return JSON.parse(s);
}

export const generateStudyPack = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are an expert study-pack generator. From the document below, return ONLY valid minified JSON (no markdown, no commentary) matching exactly this TypeScript type:

{
  "title": string,
  "summary": string,                                  // 2-3 sentences
  "keyPoints": string[],                              // 5-8 items
  "flashcards": { "q": string, "a": string }[],      // 8-12 items
  "mcqs": {
    "question": string,
    "options": string[],                              // exactly 4
    "answerIndex": number,                            // 0..3
    "explanation": string
  }[],                                                // 6-10 items
  "mindmap": {
    "root": string,
    "branches": { "label": string, "children": string[] }[]  // 4-7 branches, each 3-5 children
  },
  "slides": { "title": string, "bullets": string[] }[]  // 6-10 slides, 3-5 bullets each
}

Document${data.filename ? ` (${data.filename})` : ""}:
---
${data.text}
---

Return the JSON object now.`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt,
    });

    const parsed = extractJson(text);
    return StudyPackSchema.parse(parsed) as StudyPack;
  });
