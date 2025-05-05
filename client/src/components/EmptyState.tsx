import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  onRetry: () => void;
}

export default function EmptyState({ onRetry }: EmptyStateProps) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
            <AlertCircle className="h-10 w-10" />
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">No pull requests found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          We couldn't find any pull requests in the specified repository. Please check the repository URL and try again.
        </p>
        <Button
          onClick={onRetry}
          className="bg-primary-500 hover:bg-primary-600 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try another repository
        </Button>
      </div>
    </section>
  );
}
