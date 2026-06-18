// Browser-side study pack generator. Calls Google Gemini directly with a
// user-supplied API key (BYOK). No server function — works on any static
// host (Vercel, Netlify, GitHub Pages, etc).

import { z } from "zod";

export const StudyPackSchema = z.object({
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

function extractJson(raw: string): unknown {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
  return JSON.parse(s);
}

const PROMPT_TEMPLATE = (text: string, filename?: string) =>
  `You are an expert study-pack generator. From the document below, return ONLY valid minified JSON (no markdown, no commentary) matching exactly this TypeScript type:

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

Document${filename ? ` (${filename})` : ""}:
---
${text}
---

Return the JSON object now.`;

export async function generateStudyPack(opts: {
  text: string;
  filename?: string;
  apiKey: string;
  model?: string;
}): Promise<StudyPack> {
  const model = opts.model || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: PROMPT_TEMPLATE(opts.text, opts.filename) }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    let msg = `Gemini API error (${res.status})`;
    try {
      const j = await res.json();
      msg = j?.error?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const json = await res.json();
  const text: string =
    json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("Empty response from Gemini");

  const parsed = extractJson(text);
  return StudyPackSchema.parse(parsed);
}
