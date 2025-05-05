import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeToggle";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="diff-digest-theme">
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <App />
    </QueryClientProvider>
  </ThemeProvider>
);
