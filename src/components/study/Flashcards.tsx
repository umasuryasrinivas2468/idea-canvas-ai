import { useState } from "react";
import type { StudyPack } from "@/lib/study-agent";

export function Flashcards({ cards }: { cards: StudyPack["flashcards"] }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (cards.length === 0) return null;
  const card = cards[idx];

  const go = (delta: number) => {
    setFlipped(false);
    setIdx((i) => (i + delta + cards.length) % cards.length);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={`flip-card glow w-full max-w-2xl aspect-[16/10] cursor-pointer ${
          flipped ? "flipped" : ""
        }`}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="flip-card-inner">
          <div className="flip-face card-soft bg-[var(--surface)]">
            <span className="text-xs uppercase tracking-widest text-[var(--accent)] mb-3">
              Question {idx + 1} / {cards.length}
            </span>
            <p className="text-2xl font-medium leading-snug">{card.q}</p>
            <span className="text-xs text-muted-foreground mt-6">Click to reveal</span>
          </div>
          <div className="flip-face flip-back card-soft bg-[var(--primary)] text-[var(--primary-foreground)]">
            <span className="text-xs uppercase tracking-widest opacity-70 mb-3">Answer</span>
            <p className="text-xl leading-relaxed">{card.a}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => go(-1)}
          className="px-5 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--secondary)] transition"
        >
          ← Prev
        </button>
        <button
          onClick={() => go(1)}
          className="px-5 py-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
