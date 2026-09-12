# Prism AI — Free Advanced AI Tools for Everyone

A free, no‑API‑key clone of the multi‑assistant AI platform concept (à la mr7.ai), rebuilt as an
open, accessible tool for teams and individuals. Chat with a lineup of specialist assistants,
generate images, and keep your history — all client‑side, no backend, no billing.

**Live:** https://raczkovic.github.io/prism-ai/

---

## What it does

- **6 specialist assistants**, each with its own expertise, personality and starter prompts:
  - **Prism** — general all‑rounder
  - **Forge** — code & debugging
  - **Sentinel** — *defensive* security & secure coding (educational / blue‑team only)
  - **Scout** — research & analysis
  - **Sage** — writing & editing
  - **Vision** — AI image generation studio
- **Real‑time streaming** answers, token by token.
- **Markdown + code** rendering with syntax highlighting and one‑click copy on every code block.
- **Reasoning view** — models that "think" show a collapsible Thoughts panel.
- **Image generation** — describe anything in Vision, or use `/image <prompt>` from any assistant.
- **Local, private history** — conversations live in your browser's `localStorage`; nothing is sent to us.
- **Model picker** — switch between GPT‑5 family, Claude, Gemini, DeepSeek, GLM and more.
- **Responsive** — works on desktop, tablet and phone. Dark, theme‑aware UI.

## How it's free

Prism AI is a **static site** (HTML/CSS/JS, no server). AI runs through
[**Puter.js**](https://developer.puter.com/) — a keyless, browser‑side "user‑pays" AI SDK.
On first use your browser shows a one‑tap Puter consent dialog; after that it just works.
There are **no API keys to paste and no billing to set up**.

> Because everything runs client‑side, there is nothing to deploy but static files — which is why
> it can live for free on GitHub Pages.

## Run locally

```bash
node serve.mjs        # serves the site on http://localhost:5252
```

Any static file server works; there is no build step.

## Deploy

It's plain static files. Push to a `gh-pages`‑style host (GitHub Pages, Netlify, Cloudflare Pages,
any bucket). This repo is published via **GitHub Pages** from the `main` branch root.

## Project layout

```
index.html          landing page + app shell
assets/styles.css   all styling (dark, theme-aware, responsive)
assets/app.js       assistants, chat, streaming, images, storage
serve.mjs           tiny local static server (preview only)
```

## Responsible use

Prism AI is a general productivity tool. The **Sentinel** assistant is scoped to *defensive*
security and education — it does not produce exploits, malware, or intrusion instructions.
Use the platform lawfully and responsibly. Not affiliated with any commercial AI vendor.

---

*Built with [Claude Code](https://claude.com/claude-code).*
