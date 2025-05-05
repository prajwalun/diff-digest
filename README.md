# Diff Digest

<div align="center">

![Diff Digest Logo](generated-icon.png)

**AI-powered GitHub Pull Request analysis and release note generation**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-purple.svg)](https://vitejs.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green.svg)](https://openai.com/)

</div>

## 🚀 Features

- **Intelligent PR Analysis**: Extract insights from GitHub Pull Request diffs using OpenAI's GPT-4
- **Developer Notes**: Generate technical documentation for engineering teams
- **Marketing Summaries**: Create non-technical release notes for customer-facing teams
- **GitHub Integration**: Easily connect to any public GitHub repository
- **Modern UI**: Responsive design with light and dark mode support

## 📋 Overview

Diff Digest helps development teams transform pull request information into comprehensive documentation suitable for both developers and non-technical stakeholders. By analyzing PR diffs, commits, and descriptions, Diff Digest generates:

1. **Technical Notes** - Detailed explanations of code changes, architectural decisions, and implementation details
2. **Marketing Summaries** - User-friendly explanations of new features and improvements suitable for release notes

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Express.js, Node.js
- **AI**: OpenAI GPT-4 API
- **Third-party APIs**: GitHub API
- **Build Tools**: Vite, ESBuild
- **UI Components**: Radix UI, Lucide icons

## 🏗️ Architecture

The application is built as a modern web app with:

- React frontend with custom hooks and context providers
- Express.js backend for API requests and OpenAI integration
- GitHub API integration for repository data
- Real-time updates with streaming responses from OpenAI

## 🌟 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- GitHub token (optional, increases rate limits)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/prajwalun/diff-digest.git
   cd diff-digest
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file with your OpenAI API key

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## 🔧 Usage

1. Enter a GitHub repository URL or owner/repo in the format `owner/repo`
2. Browse the list of recent pull requests
3. Select a pull request to analyze
4. View the generated developer notes and marketing summaries
5. Copy the notes for use in documentation, release notes, or communication

## 📸 UI Features

### Enhanced Notification System

The application features a sophisticated notification system that provides contextual feedback:

- **Error notifications**: Red-themed alerts with retry buttons
- **Warning notifications**: Orange-themed alerts for potential issues
- **Success notifications**: Green-themed confirmations for completed actions
- **Interactive buttons**: Context-aware action buttons that help users recover from errors or take suggested actions

These notifications are designed to be non-intrusive while providing maximum value through:

- Clear iconography that signals the nature of the message
- Concise but informative text content
- Interactive elements that provide immediate paths to resolution
- Consistent styling that respects the user's selected theme (dark or light mode)

## ✨ Advanced Features

- **Recent Searches**: Quick access to your previously viewed repositories
- **Popular Repositories**: One-click access to popular GitHub projects
- **Custom Styling**: Theme support with light and dark modes
- **Enhanced Notifications**: Color-coded toast messages with interactive action buttons (see UI Features section)
- **Animation Effects**: Subtle UI animations for improved user experience
- **Responsive Design**: Optimized layout for desktop, tablet, and mobile devices
- **GitHub Integration**: Connect with any public repository for PR analysis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

Project Link: [https://github.com/prajwalun/diff-digest](https://github.com/prajwalun/diff-digest)

---

<div align="center">
  <p>Built with ❤️ by the Diff Digest team</p>
</div>

# UI Inspiration from Replit, ChatGPT, Gemini
