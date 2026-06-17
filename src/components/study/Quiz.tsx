import { useState } from "react";
import type { StudyPack } from "@/lib/study-agent.functions";

export function Quiz({ mcqs }: { mcqs: StudyPack["mcqs"] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);

  const score = mcqs.reduce(
    (acc, q, i) => acc + (answers[i] === q.answerIndex ? 1 : 0),
    0,
  );

  return (
    <div className="space-y-6">
      {mcqs.map((q, i) => (
        <div key={i} className="card-soft p-6">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-[var(--accent)] font-mono text-sm">Q{i + 1}</span>
            <h3 className="text-lg font-medium">{q.question}</h3>
          </div>
          <div className="grid gap-2">
            {q.options.map((opt, oi) => {
              const selected = answers[i] === oi;
              const correct = revealed && oi === q.answerIndex;
              const wrong = revealed && selected && oi !== q.answerIndex;
              return (
                <button
                  key={oi}
                  disabled={revealed}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                  className={`text-left px-4 py-3 rounded-xl border transition ${
                    correct
                      ? "border-emerald-400 bg-emerald-400/10"
                      : wrong
                        ? "border-red-400 bg-red-400/10"
                        : selected
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <span className="font-mono text-xs text-muted-foreground mr-3">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {revealed && (
            <p className="mt-4 text-sm text-muted-foreground italic border-l-2 border-[var(--accent)] pl-3">
              {q.explanation}
            </p>
          )}
        </div>
      ))}
      <div className="sticky bottom-4 flex justify-center">
        <button
          onClick={() => setRevealed((r) => !r)}
          className="px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-medium glow"
        >
          {revealed ? `Score: ${score} / ${mcqs.length} — Hide answers` : "Reveal answers"}
        </button>
      </div>
    </div>
  );
}
