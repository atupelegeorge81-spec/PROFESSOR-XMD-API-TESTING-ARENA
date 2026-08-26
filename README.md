# 🧠 PROFESSOR-XMD API TESTING ARENA

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A high-performance, cyberpunk-themed AI chat interface designed for seamless testing and interaction with multiple Large Language Model (LLM) providers. Built with speed, privacy, and developer experience in mind.

---

## ✨ Key Features

- 🌐 **Multi-Provider Support**: Native integration with OpenAI, Anthropic (Claude), Google Gemini, Groq, OpenRouter, DeepSeek, and Mistral AI.
- ⚡ **Dynamic Model Fetching**: Automatically detects the API key prefix and fetches the latest available models directly from the provider's endpoint.
- 🧠 **Advanced Reasoning Stream**: Dedicated parsing for `<think>` blocks and `reasoning_content` (e.g., DeepSeek R1, Claude 3.7 Sonnet), separating thought processes from final output.
- 💾 **Local Persistence**: Chat sessions, API configurations, and system prompts are securely saved in `localStorage`, surviving page refreshes.
- 📱 **Responsive Cyberpunk UI**: Glassmorphism design, animated particle backgrounds, and mobile-optimized layouts with robust back-button history trapping.
- 🔒 **Client-Side Privacy**: API keys are stored only in the browser's local memory/storage. No backend server is required to process your requests.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Custom CSS Variables |
| **State Management** | React Hooks (`useState`, `useEffect`, `useRef`) |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
   git clone https://github.com/atupelegeorge81-spec/PROFESSOR-XMD-API-TESTING-ARENA.git
   cd PROFESSOR-XMD-API-TESTING-ARENA
```

2. Install dependencies:
```bash
   npm install
   # or
   bun install
```

3. Start the development server:
```bash
   npm run dev
   # or
   bun run dev
```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Deployment

The easiest way to deploy PROFESSOR-XMD is via **Vercel**:

1. Push your code to a GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import your GitHub repository (`PROFESSOR-XMD-API-TESTING-ARENA`).
4. Vercel will automatically detect the Vite + React framework.
5. Click **Deploy**. 

*No environment variables are strictly required for the app to function, as users input their own API keys directly in the UI.*

---

## 🧩 Supported Providers & Key Prefixes

| Provider | Key Prefix Example | Reasoning Support |
| :--- | :--- | :--- |
| **OpenAI** | `sk-proj-...` | ✅ (o1, o3-mini) |
| **Anthropic** | `sk-ant-...` | ✅ (Claude 3.7 Sonnet) |
| **Google Gemini** | `AIza...` or `AQ....` | ✅ (Gemini 2.0 Flash Thinking) |
| **Groq** | `gsk_...` | ✅ (DeepSeek R1 Distill) |
| **OpenRouter** | `sk-or-v1-...` | ✅ (Varies by model) |
| **DeepSeek** | `sk-ds-...` | ✅ (DeepSeek Reasoner) |
| **Mistral AI** | `mk-...` | ❌ |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/atupelegeorge81-spec/PROFESSOR-XMD-API-TESTING-ARENA/issues).

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/atupelegeorge81-spec">Atupele George</a></sub>
</div>
