# Deploying to Vercel

This project is built on **TanStack Start** and ships configured for Lovable's
hosting (Cloudflare Workers via Nitro). To deploy the same code on **Vercel**:

## 1. Push to GitHub

In the Lovable editor: **+ menu → GitHub → Connect project → Create Repository**.

## 2. Switch the Nitro preset to Vercel

Edit `vite.config.ts` and override the Nitro preset:

```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    // @ts-expect-error nitro config passthrough
    nitro: { preset: "vercel" },
  },
});
```

> ⚠️ Doing this in Lovable will **break Lovable's own preview** (it expects the
> Cloudflare preset). Make this change on a Vercel-only branch, or after you
> stop using the Lovable editor for this project.

## 3. Import on Vercel

1. Go to <https://vercel.com/new>
2. Import the GitHub repo
3. Framework preset: **Other** (Vercel auto-detects Vite + Nitro output)
4. Build command: `bun run build` (or `npm run build`)
5. Output directory: leave blank — Nitro's Vercel preset writes to `.vercel/output`

## 4. Environment variables

Add in **Vercel → Project → Settings → Environment Variables**:

| Name              | Value                                              |
| ----------------- | -------------------------------------------------- |
| `LOVABLE_API_KEY` | Copy from this project's Lovable Cloud secrets     |

The AI agent uses this key to call the Lovable AI Gateway. You can rotate it
anytime from the Lovable editor.

## 5. Deploy

Push to `main` — Vercel will build and ship. Subsequent commits auto-deploy.

---

### Notes

- Server functions (`src/lib/*.functions.ts`) run on Vercel's serverless runtime.
- Document parsing (PDF/DOCX) happens **in the browser**, so no native binaries
  or Node-only packages are required on the server.
- `pptxgenjs` also runs in the browser — the .pptx download is generated client-side.
