// src/app/api/generate-notes/route.ts

import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { title, diff } = await req.json();

    if (!title || !diff) {
      return new Response(JSON.stringify({ error: 'Missing title or diff' }), {
        status: 400,
      });
    }

    const prompt = `
You are an expert technical writer. Given the title and diff from a GitHub PR, generate:

Developer Notes:
- A clear, technical summary of changes (bullet points only).
- Include what changed, which files or features were affected, and technical reasons.
- No repetition of the "Developer Notes:" heading.

Marketing Notes:
- A short 1–2 paragraph summary for non-technical stakeholders.
- Focus on the impact, value, or improvement.
- Start with the tag: [MARKETING] (for parser splitting).
- No repetition of the "Marketing Notes:" heading.

Title: ${title}
Diff:
${diff}
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You generate developer and marketing notes for GitHub pull requests. Return raw text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

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
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('[generate-notes-error]', err);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: err.message,
      }),
      { status: 500 }
    );
  }
}
