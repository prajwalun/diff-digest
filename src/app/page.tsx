"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { EmptyState } from "./components/EmptyState";
import { HeroBanner } from "@/components/HeroBanner";
import { PRList } from "@/components/PRList";
import { NoteViewer } from "./components/NoteViewer";
import { Pagination } from "./components/Pagination";
import { PullRequest } from "../lib/types";

interface ApiResponse {
  diffs: PullRequest[];
  nextPage: number | null;
  currentPage: number;
  perPage: number;
  totalPages: number;
}

export default function Home() {
  const [diffs, setDiffs] = useState<PullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [devNotes, setDevNotes] = useState("");
  const [marketingNotes, setMarketingNotes] = useState("");
  const [streaming, setStreaming] = useState(false);

  const notesRef = useRef<HTMLDivElement | null>(null);

  const fetchDiffs = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sample-diffs?page=${page}&per_page=5`);
      if (!res.ok) throw new Error("Failed to fetch diffs");
      const data: ApiResponse = await res.json();
      setDiffs(data.diffs);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setInitialFetchDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNotes = async (pr: PullRequest) => {
    setDevNotes("");
    setMarketingNotes("");
    setStreaming(true);
    setSelectedPR(pr);

    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pr.description, diff: pr.diff }),
      });

      const text = await res.text();
      const [dev, marketing] = text.split("[MARKETING]");
      setDevNotes(dev.trim());
      setMarketingNotes(marketing.trim());

      setTimeout(() => {
        notesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch {
      setDevNotes("Error generating notes.");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* ✅ Hero Banner */}
        <HeroBanner onFetch={() => fetchDiffs(1)} isLoading={isLoading} />

        {/* ❌ Error State */}
        {error && (
          <div className="text-red-600 bg-red-100 dark:bg-red-900/30 p-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {/* 🕳️ Empty State */}
        {!initialFetchDone && !isLoading && (
          <EmptyState onFetch={() => fetchDiffs(1)} />
        )}

        {/* ✅ PR List Section */}
        {diffs.length > 0 && (
          <>
            <PRList
              prs={diffs}
              onGenerateNotes={handleGenerateNotes}
              isGenerating={streaming}
              generatingPrId={selectedPR?.id ?? null}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => fetchDiffs(page)}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => fetchDiffs(page)}
            />
          </>
        )}

        {/* 📝 Generated Notes */}
        <motion.div
          ref={notesRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedPR ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedPR && (
            <NoteViewer
              notes={{
                developerNotes: devNotes,
                marketingNotes: marketingNotes,
                prNumber: selectedPR.number,
                prTitle: selectedPR.title,
                generatedAt: new Date().toISOString(),
                prId: selectedPR.id,
              }}
              isGenerating={streaming}
            />
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
