import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import FetchPRSection from "@/components/FetchPRSection";
import PRList from "@/components/PRList";
import GeneratedNotes from "@/components/GeneratedNotes";
import { PR, NotesData } from "@/lib/types";

export default function Home() {
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);
  const [prs, setPRs] = useState<PR[]>([]);
  const [selectedPR, setSelectedPR] = useState<PR | null>(null);
  const [isLoadingPRs, setIsLoadingPRs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NotesData>({ developer: "", marketing: "" });
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      
      <main className="flex-grow">
        {/* Hero Section with modern animations */}
        <section className="py-16 md:py-24 px-4 text-center relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Top right decorative element */}
            <div className="absolute top-10 right-[10%] w-64 h-64 bg-highlight-purple/5 rounded-full blur-3xl animate-pulse-slow"></div>
            
            {/* Top left decorative element */}
            <div className="absolute top-40 left-[5%] w-72 h-72 bg-highlight-blue/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            
            {/* Bottom right decorative element */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-highlight-yellow/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            
            {/* Code blocks decoration - floating elements */}
            <div className="absolute top-1/4 left-[15%] transform -rotate-6 animate-float opacity-20 hidden md:block" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-2 bg-highlight-purple rounded"></div>
              <div className="w-24 h-2 bg-highlight-purple/60 rounded mt-2"></div>
              <div className="w-20 h-2 bg-highlight-purple/40 rounded mt-2"></div>
            </div>
            
            <div className="absolute bottom-1/4 right-[15%] transform rotate-6 animate-float opacity-20 hidden md:block" style={{ animationDelay: '1.5s' }}>
              <div className="w-16 h-2 bg-highlight-blue rounded"></div>
              <div className="w-24 h-2 bg-highlight-blue/60 rounded mt-2"></div>
              <div className="w-12 h-2 bg-highlight-blue/40 rounded mt-2"></div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-highlight-purple/30 blur-xl rounded-full rotate-12 scale-125 animate-pulse-slow"></div>
                <div className="relative h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg transform rotate-6 transition-all duration-500 hover:rotate-12 hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0019.586 6L14 0.414A2 2 0 0012.586 0H10zm0 2v4a1 1 0 001 1h5v9H10V4zm7 11a1 1 0 11-2 0 1 1 0 012 0zm-8-7H7a1 1 0 110-2h2a1 1 0 110 2zm0 4H7a1 1 0 110-2h2a1 1 0 110 2zm0 4H7a1 1 0 110-2h2a1 1 0 110 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight gradient-text">Your GitHub Pull Request Digest</h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Generate intelligent developer and marketing notes from your GitHub PRs using AI-powered analysis.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mt-6 mb-10">
              <div className="flex items-center rounded-full bg-highlight-purple/10 px-4 py-2 text-sm hover:bg-highlight-purple/15 transition-colors">
                <span className="mr-2 h-2 w-2 rounded-full bg-highlight-purple"></span>
                Intelligent PR Analysis
              </div>
              <div className="flex items-center rounded-full bg-highlight-blue/10 px-4 py-2 text-sm hover:bg-highlight-blue/15 transition-colors">
                <span className="mr-2 h-2 w-2 rounded-full bg-highlight-blue"></span>
                Developer Notes
              </div>
              <div className="flex items-center rounded-full bg-highlight-green/10 px-4 py-2 text-sm hover:bg-highlight-green/15 transition-colors">
                <span className="mr-2 h-2 w-2 rounded-full bg-highlight-green"></span>
                Marketing Summaries
              </div>
            </div>
          </div>
        </section>

        {/* Repository Input Section */}
        <FetchPRSection
          repoInfo={repoInfo}
          setRepoInfo={setRepoInfo}
          setPRs={setPRs}
          setSelectedPR={setSelectedPR}
          setIsLoadingPRs={setIsLoadingPRs}
          isLoadingPRs={isLoadingPRs}
          setError={setError}
        />

        {/* Pull Request List Section */}
        {error ? null : (
          <PRList
            prs={prs}
            selectedPR={selectedPR}
            setSelectedPR={setSelectedPR}
            isLoading={isLoadingPRs}
          />
        )}

        {/* Generated Notes Section */}
        {error ? null : (
          <GeneratedNotes
            selectedPR={selectedPR}
            notes={notes}
            setNotes={setNotes}
            isGeneratingNotes={isGeneratingNotes}
            setIsGeneratingNotes={setIsGeneratingNotes}
            setError={setError}
          />
        )}
      </main>

      <footer className="border-t border-border/30 backdrop-blur-sm bg-background/80 py-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-1/3 w-1/3 h-px bg-gradient-to-r from-transparent via-highlight-purple/20 to-transparent"></div>
          <div className="absolute bottom-10 right-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-highlight-blue/20 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1 flex items-center">
              <div className="text-sm font-medium mr-2">Powered by</div>
              <div className="flex space-x-3">
                <div className="text-highlight-purple/80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5097-2.6067-1.4997z" />
                  </svg>
                </div>
                <div className="text-highlight-yellow/80">
                  <svg className="h-6 w-6" viewBox="0 0 256 154" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="currentColor">
                    <path d="M80.6,16.62c-64.02,0-68.14,29.17-68.14,29.17v29.16h69.2v8.34H41.51c0,0-39.78-4.43-39.78,57.92c0,62.36,34.73,60.05,34.73,60.05h20.67v-28.92c0,0-1.11-34.74,34.12-34.74h58.67c0,0,33-0.56,33-31.73V46.94C182.93,46.94,186.7,16.62,80.6,16.62z M60.11,35.3c6.88,0,12.43,5.55,12.43,12.43c0,6.87-5.55,12.42-12.43,12.42c-6.87,0-12.43-5.55-12.43-12.42 C47.67,40.85,53.23,35.3,60.11,35.3z" />
                    <path d="M114.93,83.29h69.21v28.92c0,0,4.19,34.73-66.43,34.73c-70.62,0-67.71-61.31-67.71-61.31l22.81-0.01v29.4c0,0-1.09,33,32.76,33h58.67c0,0,33,0.9,33-31.39v-24.99h-82.31V83.29z M139.57,143.09c-6.87,0-12.43-5.55-12.43-12.43c0-6.87,5.56-12.42,12.43-12.42c6.88,0,12.43,5.55,12.43,12.42C152,137.54,146.44,143.09,139.57,143.09z"/>
                  </svg>
                </div>
                <div className="text-highlight-green/80">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 16c0-2.6-1.6-4.8-4-5.6.4-1 .6-2.2.6-3.4 0-5-4-9-9-9v2c3.8 0 7 3.2 7 7 0 .8-.2 1.6-.4 2.4-1-.3-2-.4-3.2-.4C3.2 9 0 12.2 0 16c0 3.1 2 5.8 4.8 6.6-.2.8-.4 1.6-.4 2.4 0 5 4 9 9 9v-2c-3.8 0-7-3.2-7-7 0-.8.2-1.6.4-2.4 1 .3 2 .4 3.2.4 4.8 0 8-3.2 8-7v-2c3.8 0 7-3.2 7-7h-2c-3.8 0-7 3.2-7 7zM9 9c1 0 1.8.2 2.6.4-.4 1-1.5 1.8-2.6 2.4-1.2.6-2.4 1-3.6 1C6.8 10.8 7.8 9 9 9zM6.4 24.2c.4-1 1.5-1.8 2.6-2.4 1.2-.6 2.4-1 3.6-1-1.4 2-2.4 3.8-3.6 3.8-1 0-1.8-.2-2.6-.4zM16 16c0 2-1.4 3.6-3.2 4.6-1.8-1-3.2-2.6-3.2-4.6 0-2 1.4-3.6 3.2-4.6 1.8 1 3.2 2.6 3.2 4.6z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1 text-center">
              <div className="text-xs text-muted-foreground">
                © 2025 Diff Digest. Built with OpenAI and GitHub API.
              </div>
            </div>
            
            <div className="md:col-span-1 flex justify-center md:justify-end space-x-4">
              <a href="https://github.com/prajwalun/diff-digest" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
