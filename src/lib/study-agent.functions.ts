import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
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

export const generateStudyPack = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are an expert study-pack generator. From the document below, produce a study pack with:
- a concise title
- a 2-3 sentence summary
- 5-8 key points
- 8-12 flashcards (clear Q/A)
- 6-10 multiple-choice questions (4 options each, with answerIndex 0-3 and a short explanation)
- a mindmap: one root concept, 4-7 branches, each with 3-5 child concepts
- 6-10 presentation slides with a title and 3-5 bullets each

Document${data.filename ? ` (${data.filename})` : ""}:
---
${data.text}
---`;

    const { experimental_output } = await generateText({
      model: gateway.chatModel("google/gemini-3-flash-preview"),
      output: Output.object({ schema: StudyPackSchema }),
      prompt,
    });

    return experimental_output as StudyPack;
  });
