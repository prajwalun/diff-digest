import * as React from "react"
import { motion } from "framer-motion"
import { GitPullRequest, RefreshCw, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface FetchPRSelectionProps {
  onFetch: () => void
  isLoading: boolean
  repoName?: string
}

export function FetchPRSelection({ 
  onFetch, 
  isLoading, 
  repoName = "username/repository" 
}: FetchPRSelectionProps) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className="glass-card overflow-hidden hover-scale">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary text-white shadow-md">
              <GitPullRequest className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gradient">Fetch Pull Requests</h2>
              <p className="text-sm text-muted-foreground">
                Repo: <span className="font-medium">{repoName}</span>
              </p>
            </div>
          </div>
          <Button 
            onClick={onFetch} 
            disabled={isLoading}
            className="button-primary px-6 py-3"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Github className="h-4 w-4 mr-2" />
                Fetch Latest Diffs
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.section>
  )
}
