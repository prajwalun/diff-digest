import { PR } from "./types";
import { apiRequest } from "./queryClient";

/**
 * Fetches pull requests from GitHub for a given repo
 */
export async function fetchPRs(owner: string, repo: string): Promise<PR[]> {
  try {
    const response = await fetch(`/api/github/prs?owner=${owner}&repo=${repo}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to fetch PRs: ${response.status}`);
    }
    
    const data = await response.json();
    return data.pullRequests;
  } catch (error) {
    console.error("Error fetching PRs:", error);
    throw error;
  }
}

/**
 * Generates notes for a specific PR using OpenAI with streaming support
 */
export async function generateNotes(
  owner: string, 
  repo: string, 
  pr_number: number, 
  pr_title: string,
  diff_url: string,
  diff_content?: string,
  onStreamUpdate?: (type: string, content: string) => void
): Promise<{
  technicalNotes?: string;
  marketingNotes?: string;
  error?: string;
}> {
  try {
    // If we have a streaming callback, use streaming mode
    if (onStreamUpdate) {
      // Prepare the request body
      const requestBody = {
        owner,
        repo,
        pr_number,
        pr_title,
        pr_diff: diff_url,
        diff_content
      };
      
      // Create fetch options with POST method and JSON body
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      };
      
      // Make the request
      const response = await fetch('/api/notes/generate', options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to generate notes: ${response.status}`);
      }
      
      // Set up an event source for server-sent events
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error("Failed to create stream reader");
      }
      
      // Process the stream
      let technicalNotes = "";
      let marketingNotes = "";
      let decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process each complete SSE message
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || ""; // Keep the last potentially incomplete message in the buffer
        
        for (const message of messages) {
          if (message.startsWith("data: ")) {
            try {
              const data = JSON.parse(message.substring(6));
              
              if (data.type === "developer") {
                if (data.content) {
                  technicalNotes += data.content;
                  onStreamUpdate("developer", data.content);
                }
              } else if (data.type === "marketing") {
                if (data.content) {
                  marketingNotes += data.content;
                  onStreamUpdate("marketing", data.content);
                }
              } else if (data.type === "error") {
                throw new Error(data.content);
              }
            } catch (e) {
              console.error("Error parsing stream data:", e);
            }
          }
        }
      }
      
      return { technicalNotes, marketingNotes };
      
    } else {
      // Non-streaming fallback
      const response = await apiRequest("POST", "/api/notes/generate", {
        owner,
        repo,
        pr_number,
        pr_title,
        pr_diff: diff_url,
        diff_content
      });
      
      return await response.json();
    }
  } catch (error) {
    console.error("Error generating notes:", error);
    throw error;
  }
}
