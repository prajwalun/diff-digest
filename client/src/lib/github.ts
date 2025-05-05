import { PR } from "./types";
import { apiRequest } from "./queryClient";

/**
 * Pagination result interface
 */
export interface PaginationResult {
  page: number;
  per_page: number;
  has_next_page: boolean;
  has_prev_page: boolean;
  total_count: number | null;
}

/**
 * PR Fetch result interface with pagination
 */
export interface PRFetchResult {
  pullRequests: PR[];
  pagination: PaginationResult;
}

/**
 * Fetches pull requests from GitHub for a given repo with pagination
 */
export async function fetchPRs(
  owner: string, 
  repo: string, 
  page: number = 1, 
  perPage: number = 10
): Promise<PRFetchResult> {
  try {
    const url = `/api/github/prs?owner=${owner}&repo=${repo}&page=${page}&per_page=${perPage}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to fetch PRs: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      pullRequests: data.pullRequests,
      pagination: data.pagination
    };
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
  onStreamUpdate?: (type: string, content: string, status?: string, data?: any, resend?: boolean) => void
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
      
      console.log("Starting to process stream from OpenAI/server...");
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("Stream reading complete");
          break;
        }
        
        // Decode the chunk and add it to our buffer
        const decodedChunk = decoder.decode(value, { stream: true });
        buffer += decodedChunk;
        
        console.log(`Received chunk of size ${value.length}, decoded length: ${decodedChunk.length}`);
        
        // Process each complete SSE message
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || ""; // Keep the last potentially incomplete message in the buffer
        
        console.log(`Processing ${messages.length} complete SSE messages`);
        
        for (const message of messages) {
          if (message.startsWith("data: ")) {
            try {
              const jsonPart = message.substring(6);
              console.log(`Parsing SSE data: ${jsonPart.substring(0, 100)}${jsonPart.length > 100 ? '...' : ''}`);
              
              const data = JSON.parse(jsonPart);
              console.log(`Received message of type: ${data.type}, content length: ${data.content?.length || 0}`);
              
              // Handle special resend flag for complete content replacement
              const resend = data.resend === true;
              
              if (data.type === "developer") {
                if (data.content !== undefined) { // Check for undefined specifically
                  // If resend flag is true, we replace everything instead of appending
                  if (resend) {
                    console.log(`RESEND flag detected for developer notes, replacing content`);
                    technicalNotes = data.content;
                  } else {
                    technicalNotes += data.content;
                  }
                  
                  // Pass the resend flag to the callback
                  onStreamUpdate("developer", data.content, data.status, null, resend);
                }
              } else if (data.type === "marketing") {
                if (data.content !== undefined) { // Check for undefined specifically
                  // If resend flag is true, we replace everything instead of appending
                  if (resend) {
                    console.log(`RESEND flag detected for marketing notes, replacing content`);
                    marketingNotes = data.content;
                  } else {
                    marketingNotes += data.content;
                  }
                  
                  // Pass the resend flag to the callback
                  onStreamUpdate("marketing", data.content, data.status, null, resend);
                }
              } else if (data.type === "enrichment") {
                // Handle enrichment events with data passing
                console.log(`Enrichment event: ${data.status}`);
                onStreamUpdate("enrichment", data.content, data.status, data.data);
              } else if (data.type === "error") {
                console.error(`Error in stream: ${data.content}`);
                throw new Error(data.content);
              }
            } catch (e) {
              console.error("Error parsing stream data:", e, "Raw message:", message);
            }
          } else {
            console.log(`Skipping non-data message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
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
