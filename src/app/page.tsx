"use client";

import { useState } from "react";
import TypewriterBlock from "./components/TypewriterBlock";

interface DiffItem {
  id: string;
  description: string;
  diff: string;
  url: string;
}

interface ApiResponse {
  diffs: DiffItem[];
  nextPage: number | null;
  currentPage: number;
  perPage: number;
}

export default function Home() {
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [selectedPR, setSelectedPR] = useState<DiffItem | null>(null);
  const [devNotes, setDevNotes] = useState("");
  const [marketingNotes, setMarketingNotes] = useState("");
  const [streaming, setStreaming] = useState(false);

  const fetchDiffs = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sample-diffs?page=${page}&per_page=10`);
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to fetch diffs: ${msg}`);
      }
      const data: ApiResponse = await res.json();
      setDiffs((prev) => (page === 1 ? data.diffs : [...prev, ...data.diffs]));
      setCurrentPage(data.currentPage);
      setNextPage(data.nextPage);
      if (!initialFetchDone) setInitialFetchDone(true);
    } catch (err) {
      setError((err as Error).message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchClick = () => {
    setDiffs([]);
    fetchDiffs(1);
  };

  const handleLoadMoreClick = () => {
    if (nextPage) fetchDiffs(nextPage);
  };

  const handleGenerateNotes = async (pr: DiffItem) => {
    setDevNotes("");
    setMarketingNotes("");
    setStreaming(true);
    setSelectedPR(pr);

    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        body: JSON.stringify({
          title: pr.description,
          diff: pr.diff,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setDevNotes("Error generating notes.");
        setStreaming(false);
        return;
      }

      const text = await res.text();
      const [dev, marketing] = text.split("[MARKETING]");
      setDevNotes((dev || "").replace(/Developer Notes:/gi, "").trim());
      setMarketingNotes((marketing || "").replace(/Marketing Notes:/gi, "").trim());
    } catch (err) {
      setDevNotes("Error generating notes.");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 sm:p-24">
      <h1 className="text-4xl font-bold mb-12">Diff Digest ✍️</h1>

      <div className="w-full max-w-4xl">
        <div className="mb-8 flex space-x-4">
          <button
            onClick={handleFetchClick}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading && currentPage === 1 ? "Fetching..." : "Fetch Latest Diffs"}
          </button>
        </div>

        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 min-h-[300px] bg-gray-50 dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Merged Pull Requests</h2>

          {error && (
            <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded mb-4">
              Error: {error}
            </div>
          )}

          {!initialFetchDone && !isLoading && (
            <p className="text-gray-600 dark:text-gray-400">
              Click the button above to fetch the latest merged pull requests.
            </p>
          )}

          {initialFetchDone && diffs.length === 0 && !isLoading && !error && (
            <p className="text-gray-600 dark:text-gray-400">
              No merged pull requests found or fetched.
            </p>
          )}

          {diffs.length > 0 && (
            <ul className="space-y-3 list-disc list-inside">
              {diffs.map((item) => (
                <li key={item.id} className="text-gray-800 dark:text-gray-200">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    PR #{item.id}:
                  </a>
                  <span className="ml-2">{item.description}</span>
                  <button
                    onClick={() => handleGenerateNotes(item)}
                    className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    disabled={streaming}
                  >
                    {streaming && selectedPR?.id === item.id ? "Generating..." : "Generate Notes"}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isLoading && currentPage > 1 && (
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading more...</p>
          )}

          {nextPage && !isLoading && (
            <div className="mt-6">
              <button
                onClick={handleLoadMoreClick}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Load More (Page {nextPage})
              </button>
            </div>
          )}
        </div>

        {selectedPR && (
          <div className="mt-10 p-6 border rounded bg-white dark:bg-gray-900 shadow">
            <h3 className="text-xl font-bold mb-2">Generated Notes for PR #{selectedPR.id}</h3>
            <p className="text-sm text-gray-500 mb-4 italic">{selectedPR.description}</p>

            <div className="mb-6">
              <h4 className="text-lg font-semibold">🛠️ Developer Notes</h4>
              <pre className="whitespace-pre-wrap mt-2 text-sm text-gray-800 dark:text-gray-200">
                {streaming ? "Generating..." : devNotes ? <TypewriterBlock text={devNotes} /> : "No output"}
              </pre>
            </div>

            <div>
              <h4 className="text-lg font-semibold">🎯 Marketing Notes</h4>
              <pre className="whitespace-pre-wrap mt-2 text-sm text-gray-800 dark:text-gray-200">
                {streaming ? "Generating..." : marketingNotes ? <TypewriterBlock text={marketingNotes} /> : "No output"}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
