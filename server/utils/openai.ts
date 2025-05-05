import OpenAI from "openai";

// Get the API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check if the API key is available and valid
const isApiKeyValid = !!OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here";

// Diagnostic logging (without revealing the actual key)
console.log("OpenAI API key status:", isApiKeyValid ? "Valid key found" : "Invalid or missing key");

// Create the OpenAI client
const openai = isApiKeyValid 
  ? new OpenAI({ apiKey: OPENAI_API_KEY }) 
  : null;

// Function to check if OpenAI client is ready
export function isOpenAIReady(): boolean {
  return !!openai;
}

// Export the OpenAI instance
export default openai;