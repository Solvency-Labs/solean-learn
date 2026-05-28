# SoLean Field Guide

A noob-to-expert learning site for the team task: **formally verify
[`ForsVerifier.sol`](https://github.com/RivaLabs-Core/NiceTry/blob/main/src/Verifiers/ForsVerifier.sol)**,
a FORS post-quantum signature verifier on Ethereum, using Lean 4.

It's a curated path across the four worlds the task spans — Ethereum/EVM,
account abstraction, post-quantum/hash-based signatures (FORS), and formal
verification with Lean — pointed at one concrete goal. Built with
[Astro Starlight](https://starlight.astro.build/).

## Run it locally

```sh
npm install
npm run dev      # dev server at http://localhost:4321/solean-learn/
npm run build    # production build into ./dist
npm run preview  # serve the production build
```

> Note the `/solean-learn/` path prefix — see "Deploying" below.

## Content layout

All pages are Markdown/MDX under `src/content/docs/`:

- `orientation/` — how to use the guide, the **stack map**, the learning path
- `ethereum/` — T1: Ethereum & the EVM/Yul
- `aa-pq/` — T2: account abstraction & post-quantum
- `fors/` — T3: hash-based signatures & FORS
- `lean/` — T4: Lean 4 & formal verification
- `tooling/` — T5: EVMYulLean, verity, SoLean
- `task/` — T6: the verification task itself
- `reference/` — glossary, annotated links, **project log**

The stack-map diagram is `src/components/StackMap.astro`. Sidebar/branding/
math config is `astro.config.mjs`. Math uses KaTeX (`remark-math` +
`rehype-katex`); styles in `src/styles/custom.css`.

## Deploying (GitHub Pages)

`.github/workflows/deploy.yml` builds and deploys on push to `main`.

This is configured as a **project site** at
`https://<user>.github.io/solean-learn`, so `astro.config.mjs` sets
`base: '/solean-learn'` and a placeholder `site`. **Before deploying, update
`site` (and `base` if your repo name differs)** to match where you host it.
In the repo settings, set Pages → Source → "GitHub Actions".

## Contributing

Add a `.md`/`.mdx` file under the right `src/content/docs/` folder and add it
to the `sidebar` in `astro.config.mjs`. Keep the project's boundary
discipline: be explicit about what's **proven** vs **assumed** vs **trusted**,
and record decisions/open questions in the project log.
