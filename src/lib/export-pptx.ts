import type { StudyPack } from "./study-agent";

export async function downloadPptx(pack: StudyPack) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = pack.title;

  const NAVY = "1B2540";
  const SKY = "7CC4F5";
  const CREAM = "F4F1EA";
  const MUTED = "8C9BB5";

  // Title slide
  const s0 = pptx.addSlide();
  s0.background = { color: NAVY };
  s0.addText(pack.title, {
    x: 0.6,
    y: 2.2,
    w: 12,
    h: 1.6,
    fontSize: 48,
    bold: true,
    color: CREAM,
    fontFace: "Georgia",
  });
  s0.addText(pack.summary, {
    x: 0.6,
    y: 4.0,
    w: 12,
    h: 2,
    fontSize: 20,
    color: MUTED,
    fontFace: "Calibri",
  });
  s0.addShape("rect", { x: 0.6, y: 1.9, w: 1.2, h: 0.08, fill: { color: SKY } });

  // Content slides
  pack.slides.forEach((sl, i) => {
    const s = pptx.addSlide();
    s.background = { color: CREAM };
    s.addText(`0${i + 1}`.slice(-2), {
      x: 0.6,
      y: 0.4,
      w: 1,
      h: 0.5,
      fontSize: 14,
      color: SKY,
      bold: true,
    });
    s.addText(sl.title, {
      x: 0.6,
      y: 0.9,
      w: 12,
      h: 0.9,
      fontSize: 32,
      bold: true,
      color: NAVY,
      fontFace: "Georgia",
    });
    s.addShape("rect", { x: 0.6, y: 1.85, w: 0.8, h: 0.05, fill: { color: SKY } });
    s.addText(
      sl.bullets.map((b) => ({ text: b, options: { bullet: { code: "25CF" } } })),
      {
        x: 0.6,
        y: 2.2,
        w: 12,
        h: 4.8,
        fontSize: 20,
        color: NAVY,
        fontFace: "Calibri",
        paraSpaceAfter: 10,
      },
    );
  });

  // Key Points
  const sk = pptx.addSlide();
  sk.background = { color: NAVY };
  sk.addText("Key Takeaways", {
    x: 0.6,
    y: 0.5,
    w: 12,
    h: 0.9,
    fontSize: 32,
    bold: true,
    color: CREAM,
    fontFace: "Georgia",
  });
  sk.addText(
    pack.keyPoints.map((p) => ({ text: p, options: { bullet: { code: "25A0" } } })),
    {
      x: 0.6,
      y: 1.6,
      w: 12,
      h: 5.4,
      fontSize: 18,
      color: CREAM,
      fontFace: "Calibri",
      paraSpaceAfter: 10,
    },
  );

  await pptx.writeFile({ fileName: `${pack.title.replace(/[^\w-]+/g, "_")}.pptx` });
}
