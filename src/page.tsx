"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
// Removed imports for EmptyState and HeroBanner as they are replaced by FetchPRsSection
// import { EmptyState } from "./components/EmptyState";
// import { HeroBanner } from "./components/HeroBanner";
import { PRList } from "./components/PRList";
// REMOVED import for NoteViewer as it's replaced
// import { NoteViewer } from "./components/NoteViewer";
// Pagination is imported within PRList now
// import { Pagination } from "./components/Pagination";
import { AppHeader } from "./components/AppHeader"; // Import AppHeader

// Added import for the FetchPRsSection component (for initial state)
import { FetchPRsSection } from "./components/FetchPRSection"; // <-- CORRECTED: Assuming FetchPRsSection.tsx is the correct file name

// ADDED import for the GeneratedNotes component (replaces NoteViewer)
import { GeneratedNotes } from "./components/GeneratedNotes"; // Assuming GeneratedNotes.tsx is in src/components


import { PullRequest, GeneratedNotes as NotesType } from "../lib/types"; // Ensure types are correct

import { useQuery, useMutation } from "@tanstack/react-query"; // Assuming react-query is set up
// CORRECTED: Import toast from sonner instead of react-hot-toast
import { toast } from "sonner"; // <-- CHANGE THIS LINE


const ITEMS_PER_PAGE = 10;


export default function Home() {
  // State for error messages displayed in the UI
  const [error, setError] = useState<string | null>(null);

  // State for the currently selected PR and pagination
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Ref for scrolling to the notes section
  const notesRef = useRef<HTMLDivElement | null>(null);


  // --- React Query: Fetching PRs ---
  // This query fetches the list of pull requests
  const {
    data: prs,
    isLoading: isLoadingPrs, // Indicates initial load
    isFetching: isFetchingPrs, // Indicates background refetches
    refetch: refetchPrs, // Function to manually trigger the fetch
    isError: isPrsError,
    error: prsError,
  } = useQuery<PullRequest[], Error>({ // Specify data and error types
    queryKey: ["prs"], // Unique key for this query
    queryFn: async () => {
      // Replace with your actual API call to fetch diffs/PRs
      const res = await fetch(`/api/sample-diffs`); // Assuming this endpoint returns all PRs
       if (!res.ok) {
         const errorData = await res.json(); // Attempt to read error message from backend
         throw new Error(errorData.message || "Failed to fetch diffs");
       }
       return res.json(); // Assuming backend returns an array of PullRequest objects
    },
    enabled: false, // Prevent fetching on initial mount - triggered by user interaction
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    retry: 1, // Retry on error once
  });

  // --- React Query: Generating Notes Mutation ---
  // This mutation sends data to the LLM API to generate notes
  const {
    data: generatedNotes, // Data received from the mutation (the generated notes)
    isPending: isGeneratingNotes, // Indicates the mutation is ongoing
    mutate: generateNotesMutation, // Function to trigger the mutation
    error: notesError, // Error from the mutation
  } = useMutation<NotesType, Error, number>({ // Specify types for data, error, and variables (PR ID)
    mutationFn: async (prId: number) => { // The function that performs the API call
      // Replace with your actual API call to send PR ID to LLM for notes generation
      const res = await fetch(`/api/generate-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prId: prId }), // Assuming your endpoint expects the PR ID in the body
      });

       if (!res.ok) {
         const errorData = await res.json(); // Attempt to read error message from backend
         throw new Error(errorData.message || "Failed to generate notes");
       }

       const notesData = await res.json(); // Assuming backend returns the generated notes as JSON
       return notesData as NotesType; // Cast the response data to your GeneratedNotes type

    },
    onSuccess: (data, variables) => {
      // Action to perform on successful mutation
      // Use sonner toast calls
      toast.success("Notes generated successfully! Your AI-powered release notes are ready."); // Use sonner

      // Scroll to the generated notes section after a short delay
      setTimeout(() => {
        notesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    },
    onError: (error) => {
      // Action to perform on mutation error
      // Use sonner toast calls
      toast.error(`Error generating notes: ${error.message || "Something went wrong."}`); // Use sonner
    },
  });


  // --- Client-Side Pagination Logic ---
  // Calculates which PRs to display on the current page
  const paginatedPRs = useMemo(() => {
    if (!prs) return []; // Return empty array if no PR data
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE; // Calculate start index
    const endIndex = startIndex + ITEMS_PER_PAGE; // Calculate end index
    return prs.slice(startIndex, endIndex); // Slice the array for the current page
  }, [prs, currentPage]); // Recalculate when prs data or currentPage changes

  // Calculates the total number of pages
  const totalPages = useMemo(() => {
    if (!prs) return 1; // Default to 1 page if no PR data
    // CORRECTED: Typo here - should be ITEMS_PER_PAGE
    return Math.max(1, Math.ceil(prs.length / ITEMS_PER_PAGE)); // Calculate total pages, ensure at least 1
  }, [prs]); // Recalculate when prs data changes


  // --- Handlers ---
  // Handles the action to fetch pull requests
  const handleFetchPRs = async () => {
    setCurrentPage(1); // Reset pagination to page 1 when fetching new PRs
    setSelectedPR(null); // Clear any previously selected PR
     // setGeneratedNotes(null); // Optional: Clear generated notes on fetching new list
     refetchPrs(); // Trigger the useQuery fetch
  };

  // Handles the action to generate notes for a specific PR
  const handleGenerateNotes = (pr: PullRequest) => {
    if (isGeneratingNotes) return; // Prevent triggering mutation if one is already ongoing

    setSelectedPR(pr); // Set the selected PR in state
    generateNotesMutation(pr.id); // Trigger the useMutation with the PR's ID
  };

  // Handles the action when a pagination page is clicked
  const handlePageChange = (page: number) => {
    setCurrentPage(page); // Update the current page state
    // Optional: Scroll back to the top of the PR list or main content area
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolls the window to the top
  };


  // --- Effects ---
  // Effect to combine and manage global error state from queries/mutations
   useEffect(() => {
       if (isPrsError && prsError) {
           setError(prsError.message); // Set error message from PR query
       } else if (notesError) {
           setError(notesError.message); // Set error message from notes mutation
       } else {
           setError(null); // Clear error if no query or mutation errors
       }
   }, [isPrsError, prsError, notesError]); // Rerun when these error states or objects change

    // Effect to automatically clear the displayed error message after a delay
   useEffect(() => {
       let timer: NodeJS.Timeout;
       if (error) { // If a global error message is present
           timer = setTimeout(() => {
               setError(null); // Clear the error after 5 seconds
           }, 5000);
       }
       return () => clearTimeout(timer); // Clean up the timer on effect cleanup
   }, [error]); // Rerun when the combined error state changes


  // --- Conditional Rendering Logic ---
  // Determines whether to show the initial fetch section (FetchPRsSection)
  const showInitialFetchSection = !prs && !isLoadingPrs && !isFetchingPrs && !isPrsError && !error;

  // Determines whether to show the list of PRs
  const showPRList = (prs && prs.length > 0) && !isLoadingPrs && !isFetchingPrs;

  // Determines whether any loading or fetching is happening overall (for AppHeader)
  const showLoadingState = isLoadingPrs || isFetchingPrs || isGeneratingNotes;

  // Determines whether to show the generated notes section (GeneratedNotes)
  // Show section if notes data exists, or if generating is ongoing (to show loading/empty state within GeneratedNotes)
  const showGeneratedNotesSection = generatedNotes || isGeneratingNotes;


  return (
    // Main application container
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* App Header - Displays header and overall loading state */}
      <AppHeader isLoading={showLoadingState} />

      {/* Main content area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

        {/* Global Error Display - Shows error messages */}
        {error && (
          <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
            className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 p-4 rounded-md mb-8 flex items-center justify-between"
          >
            <div className="flex items-center">
              {/* Error icon */}
              <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
              <p className="text-sm font-medium">{error}</p> {/* Display error message */}
            </div>
            {/* Close button for error message */}
            <button onClick={() => setError(null)} className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors">
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </motion.div>
        )}


        {/* Conditional Rendering based on application state */}

        {/* Initial Fetch Section - Renders FetchPRsSection when in initial state */}
        {showInitialFetchSection && (
           <FetchPRsSection // Render FetchPRsSection
             onFetch={handleFetchPRs} // Pass the handler to fetch PRs
             isLoading={isLoadingPrs || isFetchingPrs} // Pass loading state for the fetch operation
             repoName="username/repository" // Pass the repository name as a prop
            />
        )}


        {/* PR List Section - Renders PRList and Pagination when PRs are available */}
        {showPRList && (
          <>
            <PRList // Render the list of PRs
              prs={paginatedPRs} // Pass the paginated PR data
              onGenerateNotes={handleGenerateNotes} // Pass the handler to generate notes for a PR
              isGenerating={isGeneratingNotes} // Pass the mutation loading state
              generatingPrId={selectedPR?.id || null} // Pass the ID of the PR currently generating notes
              currentPage={currentPage} // Pass current page for pagination
              totalPages={totalPages} // Pass total pages for pagination
              onPageChange={handlePageChange} // Pass the handler for page changes
            />
             {/* Pagination is rendered inside PRList in the updated PRList component, so no need for a separate Pagination component here */}
          </>
        )}

        {/* Generated Notes Section - Renders the NoteViewer when a PR is selected or generating */}
        {showGeneratedNotesSection && (
           <motion.div
              id="generated-notes-section" // ID for scrolling
              ref={notesRef} // Ref for scrolling
              initial={{ opacity: 0, y: 20 }} // Animation
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-10" // Top margin
           >
              {/* Only render GeneratedNotes if generatedNotes data exists */}
              {generatedNotes && (
                 <GeneratedNotes // Render the GeneratedNotes
                   notes={generatedNotes} // Pass the generated notes data
                   isGenerating={isGeneratingNotes} // Pass the mutation loading state
                 />
              )}

               {/* Optional: Show a loading/generating state *within* the notes section if notes data is not ready but generating */}
               {!generatedNotes && isGeneratingNotes && selectedPR && ( // Condition to show this state
                   <motion.div
                      key="generating-notes-state" // Key for animation
                      initial={{ opacity: 0, y: 20 }} // Animation
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }} // Exit animation
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center justify-center h-64 text-gray-700 dark:text-gray-300 mt-10" // Styling
                   >
                      {/* Loading spinner */}
                      <svg className="animate-spin h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0H4z"></path></svg>
                      {/* Generating message with PR number */}
                      <p className="mt-4 text-lg">Generating notes for PR #{selectedPR?.number ?? 'N/A'}...</p>
                   </motion.div>
               )}

            </motion.div>
        )}

      </main>
    </div>
  );
}