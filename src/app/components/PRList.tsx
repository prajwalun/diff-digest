import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckIcon,
  FileEditIcon,
  CalendarIcon,
  UserIcon,
  FileIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { PullRequest } from "../../lib/types"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

interface PRListProps {
  prs: PullRequest[];
  onGenerateNotes: (pr: PullRequest) => void | Promise<void>; 
  isGenerating: boolean;
  generatingPrId?: number | null;
}


export function PRList({
  prs,
  onGenerateNotes,
  isGenerating,
  generatingPrId,
}: PRListProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="animate-fade-in"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300">
            Recent Pull Requests
          </h2>
          <Badge
            variant="outline"
            className="ml-3 bg-primary/10 text-primary border-primary/20"
          >
            {prs.length} merged {prs.length === 1 ? "PR" : "PRs"}
          </Badge>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          Click "Generate Notes" to create AI-powered release notes
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {prs.map((pr, index) => (
            <motion.div
              key={pr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                delay: index * 0.1,
                duration: 0.4,
                type: "spring",
                stiffness: 100,
              }}
              layout
            >
              <Card className="glass-card overflow-hidden card-hover border-l-4 border-l-primary/50">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row lg:items-center">
                    <div className="p-5 lg:p-6 flex-1">
                      <div className="flex items-start">
                        <div className="hidden sm:flex w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-4">
                          <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap">
                            <Badge
                              variant="outline"
                              className="mr-2 text-xs px-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                            >
                              #{pr.number}
                            </Badge>
                            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                              {pr.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 lg:pr-4">
                            {pr.description}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date(pr.mergedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <UserIcon className="h-3.5 w-3.5 mr-1" />
                              <span>{pr.authorName}</span>
                            </div>
                            <div className="flex items-center">
                              <FileIcon className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {pr.filesChanged} {pr.filesChanged === 1 ? "file" : "files"}
                              </span>
                            </div>
                            <a
                              href={pr.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:text-primary/80 ml-auto"
                            >
                              <ExternalLinkIcon className="h-3.5 w-3.5 mr-1" />
                              View on GitHub
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 lg:p-6 bg-accent/30 dark:bg-accent/20 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700/50 flex justify-end items-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={
                            isGenerating && generatingPrId === pr.id
                              ? "generating"
                              : "idle"
                          }
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            onClick={() => onGenerateNotes(pr)}
                            disabled={isGenerating}
                            size="sm"
                            className={`px-5 relative ${
                              isGenerating && generatingPrId === pr.id
                                ? "bg-primary/90 text-white"
                                : "button-primary"
                            }`}
                          >
                            {isGenerating && generatingPrId === pr.id ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "linear",
                                  }}
                                  className="mr-2"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                </motion.div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <FileEditIcon className="h-4 w-4 mr-2" />
                                Generate Notes
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
