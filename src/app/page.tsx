"use client";

import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { FetchPRSelection } from "./components/FetchPRSelection";
import { EmptyState } from "./components/EmptyState";
import { PRList } from "./components/PRList";
import { NoteViewer } from "./components/NoteViewer";
import { ThemeProvider } from "./components/providers/theme-provider";
import { motion } from "framer-motion";

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
    } catch (err) {
      setError((err as Error).message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchClick = () => {
    setSelectedPR(null);
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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex flex-col"
      >
        <AppHeader title="Diff Digest" isLoading={isLoading} />

        <div className="flex-1 max-w-5xl mx-auto px-6 py-10">
          {!diffs.length && !isLoading ? (
            <EmptyState onFetch={handleFetchClick} />
          ) : (
            <>
              <FetchPRSelection onFetch={handleFetchClick} isLoading={isLoading} />

              <PRList
                prs={diffs}
                onGenerate={handleGenerateNotes}
                generatingId={streaming ? selectedPR?.id ?? null : null}
                isLoading={streaming}
                onPageChange={handleLoadMoreClick}
                currentPage={currentPage}
                totalPages={nextPage ? nextPage : currentPage}
                error={error}
              />

              {selectedPR && (
                <NoteViewer
                  notes={{
                    prId: Number(selectedPR.id),
                    prTitle: selectedPR.description,
                    developerNotes: devNotes,
                    marketingNotes: marketingNotes,
                    generatedAtts: [],
                  }}
                  isGenerating={streaming}
                />
              )}
            </>
          )}
        </div>
      </motion.main>
    </ThemeProvider>
  );
}
