// Client-side document text extraction
import mammoth from "mammoth/mammoth.browser";

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return await file.text();
  }
  if (name.endsWith(".docx")) {
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return await extractPdfText(file);
  }
  throw new Error("Unsupported file type. Upload PDF, DOCX, TXT or MD.");
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  let out = "";
  const maxPages = Math.min(pdf.numPages, 60);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    out +=
      content.items
        .map((it) => ("str" in it && typeof it.str === "string" ? it.str : ""))
        .join(" ") + "\n\n";
  }
  return out.trim();
}
