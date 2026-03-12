# Quiz Slayer Feature Expansion Design

**Date:** 2026-03-12
**Status:** Approved

## Overview

Four feature additions to Quiz Slayer: MCQ answer explanations, Vercel SPA routing fix, localStorage-based quiz progress retention, and a React Bits UI overhaul.

---

## Feature 1: MCQ Answer Explanations

### Schema Change

Add `explanation` string field to every question in all 4 JSON data files:

```json
{
  "id": 1,
  "text": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 1,
  "explanation": "Reason why B is correct..."
}
```

### Files Affected

- `src/data/compiler_construction.json`
- `src/data/freelancing.json`
- `src/data/information_security_cryptography.json`
- `src/data/parallel_distributed_computing.json`

### Display Locations

1. **QuizPage** — After answering, show explanation in an expandable card below the options with smooth reveal animation.
2. **AnalyticsPage (QuestionReview)** — Show explanation alongside correct/incorrect answer review.

### Upload Validation

`explanation` is optional in the upload validator. Custom subjects can include it but aren't required to.

---

## Feature 2: Vercel SPA Routing Fix

Add `vercel.json` at project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

All routes rewrite to `index.html`, React Router handles client-side routing.

---

## Feature 3: localStorage Progress Retention

### Auto-save

- Key: `quiz-progress-{slug}` in localStorage
- Data: `{ slug, subject, questions, answers, currentIndex, startTime, questionSet, questionCount }`
- Updated on every `answerQuestion()` and `goToQuestion()` call

### Resume Flow

On QuizPage load, check for `quiz-progress-{slug}`:
- If found, show modal: "Resume where you left off?"
  - **Resume Quiz** — Rehydrate state from saved progress
  - **Start Fresh** — Clear saved progress, start new quiz

### Clear Progress

- On quiz submission (automatic)
- On "Start Fresh" click (explicit)

### Why localStorage

- Small data (~5-10KB)
- Synchronous reads needed on page load
- Separation of concerns from IndexedDB (used for history)

---

## Feature 4: React Bits UI Overhaul

### Component Mapping

| Location | Component | Effect |
|----------|-----------|--------|
| Landing page hero | `BlurText` | Title text animates in with blur reveal |
| Landing page background | `Squares` | Subtle animated squares grid |
| Subject cards | `TiltedCard` | 3D perspective tilt on hover |
| Quiz question text | `DecryptedText` | Question "decrypts" as it appears |
| Answer click | `ClickSpark` | Spark particles on selection |
| Analytics score | `CountUp` | Score counts up dramatically |
| Navbar app name | `ShinyText` | Shimmering shine on "Quiz Slayer" |
| Explanation reveal | `AnimatedContent` | Smooth entrance animation |
| Primary CTA buttons | `StarBorder` | Animated star/light border |
| History page stats | `CountUp` | Animated counters |
| Page backgrounds | `Squares` / `DotGrid` | Subtle animated backgrounds |

### Installation

- JavaScript + Tailwind variants (matches project stack)
- Components copied into `src/components/reactbits/`
- No heavy deps (no Three.js, GSAP, OGL)

### Performance

- CSS/Canvas-based animations, no layout thrashing
- Respect `prefers-reduced-motion` where possible
- Lazy render when visible
