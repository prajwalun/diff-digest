import { Request, Response } from 'express';
import OpenAI from 'openai';

// Check if OpenAI API key is available
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const isApiKeyAvailable = !!OPENAI_API_KEY;

// Initialize OpenAI only if API key is available
const openai = isApiKeyAvailable 
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

export async function generateNotes(req: Request, res: Response) {
  try {
    // Parse the request to get PR details
    const { owner, repo, pr_number, pr_title, pr_diff } = req.body;
    
    // Validate required parameters
    if (!pr_number) {
      return res.status(400).json(
        { error: 'Missing required parameter: PR number' }
      );
    }

    // Create response content based on availability of OpenAI API
    if (!isApiKeyAvailable) {
      console.warn("OpenAI API key not found. Using fallback generated content.");
      
      // Create prInfo object for the fallback content
      const prInfo = {
        owner,
        repo,
        number: pr_number,
        title: pr_title || `PR #${pr_number}`
      };
      
      // Return a JSON response with fallback content
      return res.json({
        technicalNotes: createFallbackTechnicalNotes(prInfo),
        marketingNotes: createFallbackMarketingNotes(prInfo),
        error: "OPENAI_API_KEY not found. Using fallback content."
      });
    }
    
    // Fetch diff content if provided as URL
    let diffContent = "";
    if (pr_diff) {
      try {
        const diffResponse = await fetch(pr_diff);
        diffContent = await diffResponse.text();
      } catch (error) {
        console.error("Error fetching PR diff:", error);
      }
    }

    // Generate technical notes
    const technicalNotes = await generateTechnicalNotes(pr_title, diffContent);
    
    // Generate marketing notes
    const marketingNotes = await generateMarketingNotes(pr_title, technicalNotes);
    
    return res.json({
      technicalNotes,
      marketingNotes
    });
  } catch (err: any) {
    console.error('[generate-notes-error]', err);
    return res.status(500).json(
      {
        error: 'Internal server error',
        details: err.message,
      }
    );
  }
}

// Helper function to generate technical notes
async function generateTechnicalNotes(title: string, diffContent: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API client not initialized");
  }
  
  const developerSystemPrompt = `
    You are an AI assistant tasked with generating technical developer release notes from a GitHub pull request.
    
    GUIDELINES:
    - Be concise, technical, and focus on the 'what' and 'why' of the changes
    - Break down complex changes into digestible sections with proper headings
    - Highlight API changes, implementation details, and technical decisions
    - Mention any performance improvements or optimizations
    - Include code snippets for significant changes when applicable
    - Format the output using structured HTML tags - don't output just a single block of text
    - Ensure technical accuracy and provide clear explanations of the changes

    HTML FORMATTING REQUIREMENTS:
    - Start with an h3 tag containing a clear title summarizing the PR
    - Use <h4> tags for primary section headers like "Overview", "Implementation Details", "API Changes"
    - Use <h5> tags for sub-section headers
    - Use <p> tags for paragraphs, and ensure proper spacing between paragraphs
    - Use <ul> and <li> tags for lists, <ol> for ordered lists
    - Use <strong> tags for emphasis of important terms or concepts
    - Use <code> tags for inline code references
    - Use <pre><code> tags for multi-line code blocks
    - For file paths, use <code class="file-path">path/to/file</code>
    - For important changes, use <div class="notice notice-info"> for information blocks
    - For warnings or potential issues, use <div class="notice notice-warning">
    
    STRUCTURE THE NOTES CLEARLY WITH THE FOLLOWING SECTIONS:
    1. Brief summary/overview of the changes
    2. Technical implementation details
    3. Impact on existing code/APIs
    4. Testing considerations (if applicable)
    
    Return ONLY the developer notes with proper HTML formatting and structure.
    Ensure all HTML tags are properly closed and balanced.
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: developerSystemPrompt },
        {
          role: "user",
          content: `
            PR Title: ${title}
            
            Diff Content:
            ${diffContent.substring(0, 30000)}  // Limiting diff size for token constraints
            
            Generate comprehensive developer notes for this pull request using HTML formatting.
          `
        }
      ],
    });
    
    return response.choices[0]?.message?.content || "Failed to generate technical notes.";
  } catch (error: any) {
    console.error("Error generating technical notes:", error);
    return `<h4>Technical Notes Error</h4><p>Unable to generate technical notes. Error: ${error?.message || 'Unknown error'}</p>`;
  }
}

// Helper function to generate marketing notes
async function generateMarketingNotes(title: string, technicalNotes: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API client not initialized");
  }
  
  const marketingSystemPrompt = `
    You are an AI assistant tasked with generating user-friendly marketing release notes from a GitHub pull request.
    
    GUIDELINES:
    - Focus on user benefits and business value, not technical implementation
    - Use simple, engaging language accessible to non-technical stakeholders
    - Highlight new features, improvements, and how they help users
    - Emphasize user experience enhancements and problem-solving aspects
    - Avoid technical jargon and explain any necessary technical terms
    - Format the output using well-structured HTML tags
    - Keep it concise and highlight the user-focused aspects of the changes
    
    HTML FORMATTING REQUIREMENTS:
    - Start with an h3 tag containing an engaging title that summarizes the user benefit
    - Use <h4> tags for primary section headers like "User Benefits", "New Features", "Improvements"
    - Use <p> tags for paragraphs, and ensure proper spacing between paragraphs
    - Use <ul> and <li> tags for lists of features or benefits, making them scannable
    - Use <strong> tags for emphasis of important benefits or features
    - For highlighting key improvements, use <div class="notice notice-success"> to call attention to them
    - For indicating any noted issues or caveats, use <div class="notice notice-warning">
    
    STRUCTURE THE NOTES CLEARLY WITH THE FOLLOWING SECTIONS:
    1. Brief summary of the benefit to users
    2. Key improvements or features users will notice
    3. User impact or expected improvements
    4. Release Notes Summary with most important bullet points
    
    Return ONLY the marketing notes with proper HTML formatting and structure.
    Ensure all HTML tags are properly closed and balanced.
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: marketingSystemPrompt },
        {
          role: "user",
          content: `
            PR Title: ${title}
            
            Developer Technical Notes:
            ${technicalNotes}
            
            Generate marketing-friendly release notes that highlight the user benefits of these changes using HTML formatting.
          `
        }
      ],
    });
    
    return response.choices[0]?.message?.content || "Failed to generate marketing notes.";
  } catch (error: any) {
    console.error("Error generating marketing notes:", error);
    return `<h4>Marketing Notes Error</h4><p>Unable to generate marketing notes. Error: ${error?.message || 'Unknown error'}</p>`;
  }
}

// Helper functions to create fallback content when API key is missing
function createFallbackTechnicalNotes(prInfo: any) {
  return `<h4>Developer Notes for PR #${prInfo.number}: ${prInfo.title}</h4>

<p>This pull request contains code changes that require detailed technical review. The primary changes appear to involve functional improvements and bug fixes.</p>

<h4>Implementation Details</h4>
<ul>
  <li>Updated component structure for better maintainability</li>
  <li>Fixed edge case handling in data processing logic</li>
  <li>Improved error handling and user feedback mechanisms</li>
  <li>Enhanced type safety across the codebase</li>
</ul>

<h4>Testing Considerations</h4>
<p>The changes should be thoroughly tested across different environments to ensure compatibility and stability.</p>

<p><em>Note: These are placeholder notes. For detailed AI-generated analysis, please configure the OpenAI API key.</em></p>`;
}

function createFallbackMarketingNotes(prInfo: any) {
  return `<h4>Marketing Notes for PR #${prInfo.number}: ${prInfo.title}</h4>

<p>This update introduces new features and improvements that enhance the user experience. The main benefits include improved performance and better usability.</p>

<h4>Key Highlights</h4>
<ul>
  <li>Better visual feedback for user actions</li>
  <li>Smoother transitions between application states</li>
  <li>Enhanced navigation experience</li>
  <li>More intuitive interface elements</li>
</ul>

<h4>Customer Benefits</h4>
<p>Users will notice a more polished experience with fewer interruptions and a more intuitive workflow.</p>

<p><em>Note: These are placeholder notes. For detailed AI-generated analysis, please configure the OpenAI API key.</em></p>`;
}
