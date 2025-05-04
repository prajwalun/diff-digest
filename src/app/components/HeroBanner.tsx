// components/HeroBanner.tsx
"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface HeroBannerProps {
  onFetch: () => void;
  isLoading: boolean;
}

export function HeroBanner({ onFetch, isLoading }: HeroBannerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto max-w-4xl rounded-3xl border border-yellow-400 bg-[linear-gradient(135deg,white_0%,#fffce7_100%)] dark:bg-gradient-to-br dark:from-zinc-900 dark:to-black px-6 py-14 text-center shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
    >
      {/* Sparkling Glow */}
      <div className="absolute -bottom-2 left-1/2 h-2 w-32 -translate-x-1/2 rounded-full bg-yellow-200 blur-2xl opacity-30" />

      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <motion.div
          className="relative rounded-full bg-yellow-400 p-4 shadow-xl ring-4 ring-yellow-400/30"
          initial={{ scale: 0.95 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Zap className="h-6 w-6 text-black" />
          <div className="absolute inset-0 rounded-full bg-yellow-300 blur-md opacity-25" />
        </motion.div>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 tracking-tight">
        DIFFDIGEST
      </h1>

      {/* Tagline */}
      <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        AI-Powered Release Notes
      </p>

      {/* Divider */}
      <div className="mx-auto my-4 w-40 border-t border-yellow-300/40 dark:border-yellow-300/20" />

      {/* Repo Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        ⚡ v2.0.3 | <span className="text-muted-foreground">👨‍💻 username/repository</span>
      </div>

      {/* Button */}
      <motion.button
        onClick={onFetch}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-gray-900 transition-all disabled:opacity-50 dark:bg-yellow-500 dark:text-black"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">🔄</span> Fetching...
          </>
        ) : (
          <>
            ⚡ Fetch Latest Diffs
          </>
        )}
      </motion.button>
    </motion.section>
  );
}
