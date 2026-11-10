
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI report assistant providers

The report assistant discovers a tool-capable model from each configured
provider and falls back to the next provider when one is unavailable. The
default order is `groq,openrouter,huggingface,google,bai`; model catalog results
are cached for five minutes. Add only the provider keys you have to `.env.local`
and restart the dev server:

```env
CHAT_AI_PROVIDER_ORDER=groq,openrouter,huggingface,google,bai
GROQ_API_KEY=
OPENROUTER_API_KEY=
HF_TOKEN=
GEMINI_API_KEY=
```

Model IDs are optional overrides (`GROQ_MODEL`, `OPENROUTER_MODEL`, `HF_MODEL`,
`GEMINI_MODEL`). Without overrides, OpenRouter and Hugging Face are filtered to
models marked free and supporting tools; Groq and Google use their available
model catalogs and select a chat-capable model. Provider quotas, pricing, and
model availability depend on each account.

B.AI is optional and requires documented OpenAI-compatible chat-completions
and tool-calling support before it can be enabled:

```env
BAI_API_KEY=
BAI_API_BASE_URL=
BAI_MODEL=
```

Keep all API keys out of `NEXT_PUBLIC_*` variables and do not commit
`.env.local`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
