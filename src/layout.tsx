import { ThemeProvider } from "./components/ThemeProvider";
import { QueryProvider } from "./components/QueryProvider"; // 👈 create this wrapper
import { Toaster } from "react-hot-toast";
import "@/app/globals.css"; // ✅ keep here

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <QueryProvider> {/* ✅ Move QueryClient logic into here */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
