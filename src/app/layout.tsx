import './globals.css';
import { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from './components/ThemeProvider';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Metadata
export const metadata: Metadata = {
  title: 'Diff Digest - AI Powered Release Notes from GitHub PRs',
  description: 'Generate comprehensive, dual-purpose release notes from your GitHub pull requests - technical details for developers and user-friendly summaries for marketing.',
  keywords: 'github, pull requests, release notes, ai, developer tools, code analysis',
  authors: [{ name: 'Prajwal', url: 'https://github.com/prajwalun' }],
  creator: 'Prajwal',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://diff-digest.vercel.app',
    title: 'Diff Digest - AI Powered Release Notes from GitHub PRs',
    description: 'Generate comprehensive release notes from your GitHub pull requests',
    siteName: 'Diff Digest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diff Digest - AI Powered Release Notes from GitHub PRs',
    description: 'Generate comprehensive release notes from your GitHub pull requests',
    creator: '@prajwalun',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-x-hidden min-h-screen bg-white dark:bg-gray-900`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}