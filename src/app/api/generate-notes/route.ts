// src/app/api/generate-notes/route.ts

import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Create OpenAI client using API key from .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/generate-notes
 * Expects: { title: string, diff: string }
 * Responds with: streamed dual-tone release notes (text/event-stream)
 */
export async function POST(req: NextRequest) {
  try {
    const { title, diff } = await req.json();

    if (!title || !diff) {
      return new Response(
        JSON.stringify({ error: 'Missing title or diff' }),
        { status: 400 }
      );
    }

    const prompt = `
    You are an expert in generating software release notes from GitHub pull requests.

Your task is to analyze:
- The pull request title
- The unified diff content

And generate two clear, purpose-specific summaries:

---

## Output Format (strictly use this):

Developer Notes:
<concise, technical summary in bullet points or numbered steps>

Marketing Notes:
<short, benefit-focused summary in clear, enthusiastic language — 1–2 paragraphs max>

---

## Developer Notes – Guidelines:
- Target audience: engineers and technical stakeholders
- Focus on: what was changed, why it matters, and how it was implemented
- Mention file names, key functions, feature flags, performance changes, or structural improvements
- Use precise bullet points (not paragraphs)
- Avoid assumptions not supported by the diff

## Marketing Notes – Guidelines:
- Target audience: end-users, product teams, non-engineers
- Focus on: what benefits or improvements users can expect
- Use friendly, benefit-driven language like a product update or release blog
- It's okay to use light enthusiasm (e.g., "We're excited to introduce..." or "You'll now notice...")
- Avoid technical jargon unless absolutely necessary (and explain it briefly)
- Limit to 1–2 short paragraphs, ~100 words or less

---

## Inputs:
- Pull Request Title: ${title}
- Pull Request Diff:
${diff}

---

If the diff is unclear, just summarize what’s observable. Avoid guessing features or impact not present in the input.

Only output in this format:
Developer Notes:
...
Marketing Notes:
...
    `.trim();
    

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You generate dual-tone release notes from GitHub PRs.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Create a streaming response manually
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    });

  } catch (err: any) {
    console.error('[generate-notes-error]', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500 }
    );
  }
}
