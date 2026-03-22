# Engagix — AI LinkedIn Post Optimizer

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![License](https://img.shields.io/badge/license-ISC-green)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

> Maximize your LinkedIn engagement with AI-powered scoring, optimization, A/B testing, and viral prediction — all injected directly into LinkedIn.

---

## Features

- :chart_with_upwards_trend: **Engagement Scorer (0-100)** — Analyzes posts across 5 dimensions: readability, hook strength, emotional appeal, call-to-action, and formatting
- :wrench: **Post Optimizer** — AI-driven suggestions to boost reach and engagement
- :repeat: **A/B Variant Generator** — Create multiple post variants to test which performs best
- :fishing_pole_and_fish: **Hook Rewriter (5 Styles)** — Rewrite your opening line in Question, Bold Statement, Statistic, Story, and Contrarian styles
- :crystal_ball: **Viral Predictor (1-10)** — Predicts viral potential based on content patterns and trends
- :syringe: **LinkedIn Button Injection** — Adds an "Optimize" button directly into the LinkedIn post composer
- :orange_heart: **Orange Theme** — Vibrant, energetic UI designed for engagement focus

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Vite** | Build tool & dev server |
| **Firebase** | Authentication & data storage |
| **Chrome Extensions API** | Browser integration |

---

## Installation

### From Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/linkedin-post-optimizer-ext.git
   cd linkedin-post-optimizer-ext
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load into Chrome**
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist/` folder

### Development Mode

```bash
npm run dev
```
Runs Vite in watch mode with automatic rebuilds on file changes.

---

## Usage

### Scoring a Post
1. Write or paste a LinkedIn post into the composer
2. Click the **Engagix** button injected into LinkedIn (or open the side panel)
3. View your **Engagement Score (0-100)** with a breakdown across 5 dimensions:
   - Readability
   - Hook Strength
   - Emotional Appeal
   - Call-to-Action
   - Formatting

### Optimizing a Post
1. After scoring, click **Optimize** to receive AI suggestions
2. Review and apply recommendations to improve your score
3. Re-score to see improvements in real time

### A/B Variant Generator
1. Select **Generate Variants** from the tools menu
2. Engagix produces multiple post versions with different angles
3. Compare scores side-by-side and pick the winner

### Hook Rewriter
1. Navigate to the **Hook Rewriter** section
2. Choose from 5 styles: Question, Bold Statement, Statistic, Story, Contrarian
3. Select the rewritten hook you prefer and insert it into your post

### Viral Predictor
1. Open the **Viral Predictor** tab
2. View a score from **1 to 10** indicating your post's viral potential
3. Follow suggestions to increase your viral score

---

## Architecture

```
linkedin-post-optimizer-ext/
├── src/
│   ├── popup/              # Extension popup UI
│   ├── sidepanel/          # Full optimization workspace
│   ├── background/         # Service worker & API calls
│   ├── content/            # Content scripts for LinkedIn injection
│   ├── shared/             # Shared utilities, types, constants
│   ├── components/         # Reusable React components
│   ├── ui/                 # Base UI primitives
│   ├── utils/              # Helper functions
│   └── assets/
│       └── icons/          # Extension icons (16, 48, 128px)
├── dist/                   # Built extension output
├── vite.config.ts          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── manifest.json           # Chrome extension manifest
```

---

## Screenshots

<p align="center">
  <img src="src/assets/icons/icon-128.png" alt="Engagix Icon" width="128" height="128" />
</p>

| Icon Size | Path |
|---|---|
| 16x16 | `src/assets/icons/icon-16.png` |
| 48x48 | `src/assets/icons/icon-48.png` |
| 128x128 | `src/assets/icons/icon-128.png` |

---

## License

ISC
