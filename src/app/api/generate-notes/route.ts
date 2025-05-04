// src/app/api/generate-notes/route.ts

import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define streaming response type
interface StreamChunk {
  type: 'developer' | 'marketing';
  content: string;
  done?: boolean;
}

export const runtime = 'edge'; // Use Edge runtime for streaming support

export async function POST(req: NextRequest) {
  try {
    const { title, description, diff } = await req.json();

    if (!title || !diff) {
      return new Response(JSON.stringify({ error: 'Missing title or diff content' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start the response
    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
    // Function to send SSE data
    const sendEvent = async (data: StreamChunk) => {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
      );
    };
    
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      await sendEvent({ 
        type: 'developer', 
        content: '<p class="text-red-500">Error: OpenAI API key not found.</p>' 
      });
      writer.close();
      return response;
    }
    
    // Start processing in background
    (async () => {
      try {
        // First generate developer notes with enhanced prompt
        const developerSystemPrompt = `
          You are an AI assistant tasked with generating technical developer release notes from a GitHub pull request.
          
          GUIDELINES:
          - Be concise, technical, and focus on the 'what' and 'why' of the changes
          - Break down complex changes into digestible sections
          - Highlight API changes, implementation details, and technical decisions
          - Mention any performance improvements or optimizations
          - Include code snippets for significant changes when applicable
          - Format your response with proper HTML for readability
          
          FORMAT YOUR RESPONSE USING THESE HTML TAGS:
          - <h4> for section headings
          - <p> for paragraphs
          - <ul> and <li> for bullet points
          - <pre><code> for code blocks
          - <strong> for emphasis
          
          Return ONLY the developer notes with no introduction or explanation.
        `;
        
        const devResponse = await openai.chat.completions.create({
          model: "gpt-4o", // The newest OpenAI model released May 13, 2024
          messages: [
            { role: "system", content: developerSystemPrompt },
            {
              role: "user",
              content: `
                PR Title: ${title}
                ${description ? `PR Description: ${description}` : ''}
                
                Diff Content:
                ${diff.substring(0, 30000)}  // Limiting diff size for token constraints
                
                Generate comprehensive developer notes for this pull request.
              `
            }
          ],
          stream: true,
        });
        
        // Process and send developer notes stream
        let developerContent = "";
        for await (const chunk of devResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            developerContent += content;
            await sendEvent({
              type: 'developer',
              content
            });
          }
        }
        
        // Small pause between note types
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Now generate marketing notes with enhanced prompt
        const marketingSystemPrompt = `
          You are an AI assistant tasked with generating user-friendly marketing release notes from a GitHub pull request.
          
          GUIDELINES:
          - Focus on user benefits and business value, not technical implementation
          - Use simple, engaging language accessible to non-technical stakeholders
          - Highlight new features, improvements, and how they help users
          - Emphasize user experience enhancements and problem-solving aspects
          - Include relevant emojis to make the content more engaging
          - Avoid technical jargon and explain any necessary technical terms
          
          FORMAT YOUR RESPONSE USING THESE HTML TAGS:
          - <h4> for section headings
          - <p> for paragraphs
          - <ul> and <li> for bullet points
          - <div> for grouping content
          - Use emoji where appropriate (✨, 🚀, 🔍, etc.)
          
          Return ONLY the marketing notes with no introduction or explanation.
        `;
        
        const marketingResponse = await openai.chat.completions.create({
          model: "gpt-4o", // The newest OpenAI model released May 13, 2024
          messages: [
            { role: "system", content: marketingSystemPrompt },
            {
              role: "user",
              content: `
                PR Title: ${title}
                ${description ? `PR Description: ${description}` : ''}
                
                Developer Technical Notes:
                ${developerContent}
                
                Generate marketing-friendly release notes that highlight the user benefits of these changes.
              `
            }
          ],
          stream: true,
        });
        
        // Process and send marketing notes stream
        for await (const chunk of marketingResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            await sendEvent({
              type: 'marketing',
              content
            });
          }
        }
        
        // Send completion event
        await sendEvent({
          type: 'marketing',
          content: '',
          done: true
        });
        
      } catch (error: any) {
        console.error("OpenAI API error:", error);
        await sendEvent({ 
          type: 'developer', 
          content: `<p class="text-red-500">Error generating notes: ${error.message}</p>` 
        });
      }
      
      // Close the writer when done
      writer.close();
    })();
    
    return response;
    
  } catch (err: any) {
    console.error('[generate-notes-error]', err);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: err.message,
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}