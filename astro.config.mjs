// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// NOTE: `site` + `base` are set for a GitHub Pages *project* site at
// https://<user>.github.io/solean-learn. If you deploy to a user/org page or a
// custom domain, update both (and the deploy workflow). See README.
// https://astro.build/config
export default defineConfig({
	site: 'https://solvency-labs.github.io',
	base: '/solean-learn',
	markdown: {
		// remark-gfm is added explicitly so GFM tables/strikethrough also work in
		// .mdx pages (Astro applies GFM to .md by default, but not .mdx here).
		remarkPlugins: [remarkGfm, remarkMath],
		rehypePlugins: [rehypeKatex],
	},
	integrations: [
		starlight({
			title: 'SoLean Field Guide',
			description:
				'Noob-to-expert learning path for formally verifying the FORS post-quantum signature verifier on Ethereum, using Lean 4.',
			social: [
				{
					icon: 'github',
					label: 'SoLean on GitHub',
					href: 'https://github.com/Solvency-Labs/NiceTry',
				},
			],
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Start here',
					items: [
						{ label: 'How to use this guide', slug: 'orientation' },
						{ label: 'The stack, in one picture', slug: 'orientation/stack-map' },
						{ label: 'The learning path', slug: 'orientation/path' },
					],
				},
				{
					label: 'Project',
					items: [
						{ label: 'Roadmap', slug: 'project/roadmap' },
						{ label: 'Verification report', slug: 'project/verification-report' },
						{ label: 'Review path', slug: 'project/review-path' },
						{ label: 'Workstreams & repos', slug: 'project/workstreams' },
						{ label: 'Changelog', slug: 'project/changelog' },
						{ label: 'Project log', slug: 'reference/project-log' },
					],
				},
				{
					label: 'T1 · Ethereum & the EVM',
					items: [
						{ label: 'Ethereum in 20 minutes', slug: 'ethereum' },
						{ label: 'The EVM & Yul', slug: 'ethereum/evm-and-yul' },
						{ label: 'Reading Yul (worked example)', slug: 'ethereum/reading-yul' },
					],
				},
				{
					label: 'T2 · Account Abstraction & PQ',
					items: [
						{ label: 'ERC-4337 & smart wallets', slug: 'aa-pq' },
						{ label: 'Why PQ Ethereum rides on AA', slug: 'aa-pq/why-pq-needs-aa' },
					],
				},
				{
					label: 'T3 · Hash-based sigs & FORS',
					items: [
						{ label: 'From hashes to signatures', slug: 'fors' },
						{ label: 'Lamport: a one-time signature', slug: 'fors/lamport' },
						{ label: 'Many-time from one-time (WOTS+ & Merkle)', slug: 'fors/wots-and-merkle' },
						{ label: 'FORS: a few-time signature', slug: 'fors/the-scheme' },
						{ label: 'FORS by hand (worked example)', slug: 'fors/worked-example' },
						{ label: 'FORS, line by line', slug: 'fors/the-contract' },
					],
				},
				{
					label: 'T4 · Lean 4 & verification',
					items: [
						{ label: 'What formal verification is', slug: 'lean' },
						{ label: 'Propositions are types', slug: 'lean/curry-howard' },
						{ label: 'Tactics: building a proof', slug: 'lean/tactics' },
						{ label: 'Inductive types & induction', slug: 'lean/inductive-types-and-proofs' },
						{ label: 'A project-shaped proof', slug: 'lean/a-project-proof' },
						{ label: 'Lean exercises', slug: 'lean/exercises' },
					],
				},
				{
					label: 'T5 · The tooling',
					items: [
						{ label: 'Three tools, one stack', slug: 'tooling' },
						{ label: 'EVMYulLean', slug: 'tooling/evmyullean' },
						{ label: 'verity', slug: 'tooling/verity' },
						{ label: 'SoLean', slug: 'tooling/solean' },
					],
				},
				{
					label: 'T6 · The task',
					items: [
						{ label: 'Verifying ForsVerifier.sol', slug: 'task' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Glossary', slug: 'reference/glossary' },
						{ label: 'Annotated links', slug: 'reference/links' },
						{ label: 'Project log', slug: 'reference/project-log' },
					],
				},
			],
		}),
	],
});
