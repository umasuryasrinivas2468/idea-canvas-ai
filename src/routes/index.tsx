import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateStudyPack, type StudyPack } from "@/lib/study-agent.functions";
import { extractText } from "@/lib/parse-document";
import { downloadPptx } from "@/lib/export-pptx";
import { Flashcards } from "@/components/study/Flashcards";
import { Quiz } from "@/components/study/Quiz";
import { Mindmap } from "@/components/study/Mindmap";
import {
  Upload,
  FileText,
  Sparkles,
  Download,
  Brain,
  Layers,
  HelpCircle,
  GitBranch,
  Loader2,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studyforge — Turn any document into a study pack" },
      {
        name: "description",
        content:
          "Upload a PDF, DOCX or text file and instantly get a summary, flashcards, quiz, mindmap and downloadable slide deck. Powered by AI.",
      },
      { property: "og:title", content: "Studyforge — AI study pack from any document" },
      {
        property: "og:description",
        content:
          "Drop in a document and get flashcards, a quiz, a mindmap and a downloadable .pptx in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tab = "summary" | "cards" | "quiz" | "mindmap" | "slides";

function Index() {
  const generate = useServerFn(generateStudyPack);
  const [pack, setPack] = useState<StudyPack | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("summary");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    setPack(null);
    setFilename(file.name);
    try {
      const text = await extractText(file);
      if (text.length < 50) throw new Error("Couldn't extract enough text from that file.");
      const result = await generate({ data: { text: text.slice(0, 120000), filename: file.name } });
      setPack(result);
      setTab("summary");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPack(null);
    setError(null);
    setFilename("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="min-h-screen hero-bg">
      <header className="max-w-6xl mx-auto px-6 pt-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] grid place-items-center font-bold">
            S
          </div>
          <span className="font-display text-xl tracking-tight">Studyforge</span>
        </div>
        {pack && (
          <button
            onClick={reset}
            className="text-sm flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] hover:bg-[var(--surface)]"
          >
            <RefreshCw size={14} /> New document
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {!pack && (
          <section className="text-center pt-10 pb-12">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--accent)] mb-5">
              <Sparkles size={14} /> AI study agent
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto">
              Turn any document into a complete <em className="text-[var(--primary)] not-italic">study pack</em>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              Upload a PDF, Word doc or notes. Get a summary, flashcards, a quiz, a
              mindmap, and a downloadable slide deck — in one click.
            </p>

            <UploadZone
              ref={inputRef}
              loading={loading}
              filename={filename}
              onFile={handleFile}
            />

            {error && (
              <p className="mt-4 text-sm text-red-300 bg-red-500/10 inline-block px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 max-w-3xl mx-auto">
              {[
                { icon: FileText, label: "Summary & key points" },
                { icon: Layers, label: "Flip flashcards" },
                { icon: HelpCircle, label: "Quiz with answers" },
                { icon: GitBranch, label: "Visual mindmap" },
              ].map((f, i) => (
                <div key={i} className="card-soft p-4 text-left">
                  <f.icon size={18} className="text-[var(--accent)] mb-2" />
                  <p className="text-sm">{f.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {pack && (
          <section className="pt-4">
            <div className="card-soft p-6 mb-6">
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-2">
                {filename}
              </p>
              <h2 className="text-3xl font-bold mb-3">{pack.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{pack.summary}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 items-center">
              <TabBtn active={tab === "summary"} onClick={() => setTab("summary")} icon={Brain}>
                Key points
              </TabBtn>
              <TabBtn active={tab === "cards"} onClick={() => setTab("cards")} icon={Layers}>
                Flashcards
              </TabBtn>
              <TabBtn active={tab === "quiz"} onClick={() => setTab("quiz")} icon={HelpCircle}>
                Quiz
              </TabBtn>
              <TabBtn active={tab === "mindmap"} onClick={() => setTab("mindmap")} icon={GitBranch}>
                Mindmap
              </TabBtn>
              <TabBtn active={tab === "slides"} onClick={() => setTab("slides")} icon={FileText}>
                Slides
              </TabBtn>
              <div className="ml-auto">
                <button
                  onClick={() => downloadPptx(pack)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-medium hover:opacity-90 transition"
                >
                  <Download size={16} /> Download .pptx
                </button>
              </div>
            </div>

            {tab === "summary" && (
              <ul className="space-y-3">
                {pack.keyPoints.map((p, i) => (
                  <li key={i} className="card-soft p-5 flex gap-4">
                    <span className="text-[var(--accent)] font-mono">{`0${i + 1}`.slice(-2)}</span>
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            )}
            {tab === "cards" && <Flashcards cards={pack.flashcards} />}
            {tab === "quiz" && <Quiz mcqs={pack.mcqs} />}
            {tab === "mindmap" && <Mindmap data={pack.mindmap} />}
            {tab === "slides" && (
              <div className="grid md:grid-cols-2 gap-5">
                {pack.slides.map((s, i) => (
                  <div key={i} className="card-soft p-6 aspect-[16/10] flex flex-col">
                    <span className="text-xs font-mono text-[var(--accent)]">
                      {`0${i + 1}`.slice(-2)} / {pack.slides.length}
                    </span>
                    <h3 className="text-xl font-bold mt-2 mb-4">{s.title}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {s.bullets.map((b, bi) => (
                        <li key={bi} className="flex gap-2">
                          <span className="text-[var(--primary)]">●</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition border ${
        active
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent"
          : "border-[var(--border)] hover:bg-[var(--surface)]"
      }`}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}

const UploadZone = (() => {
  const Component = (
    {
      onFile,
      loading,
      filename,
    }: {
      onFile: (f: File) => void;
      loading: boolean;
      filename: string;
    },
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [drag, setDrag] = useState(false);
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={`mt-10 max-w-2xl mx-auto card-soft p-10 border-2 border-dashed transition ${
          drag ? "border-[var(--accent)] bg-[var(--surface)]" : "border-[var(--border)]"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
            <p className="font-medium">Reading {filename}…</p>
            <p className="text-sm text-muted-foreground">
              The agent is analysing your document and building your study pack.
            </p>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)]/15 grid place-items-center">
              <Upload className="text-[var(--primary)]" />
            </div>
            <p className="font-medium text-lg">Drop a document or click to upload</p>
            <p className="text-sm text-muted-foreground">
              PDF, DOCX, TXT or MD — up to ~60 pages
            </p>
            <input
              ref={ref}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
          </label>
        )}
      </div>
    );
  };
  return Object.assign(
    // eslint-disable-next-line react/display-name
    (require("react") as typeof import("react")).forwardRef(Component),
    {},
  );
})();
