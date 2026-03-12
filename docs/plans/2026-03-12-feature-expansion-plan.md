# Quiz Slayer Feature Expansion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add MCQ explanations, Vercel SPA routing fix, localStorage-based quiz progress retention, and React Bits UI overhaul to Quiz Slayer.

**Architecture:** Four independent feature tracks that can be implemented in sequence. Explanations require data + UI changes. Progress retention requires QuizContext + localStorage integration. React Bits components are copy-pasted into `src/components/reactbits/` (JS + Tailwind variants). No new npm dependencies needed beyond what React Bits components require internally.

**Tech Stack:** React 19, Vite 7, Tailwind CSS 3, Framer Motion 12, localStorage, React Bits (copy-paste components)

---

## Task 1: Add `vercel.json` for SPA routing

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Step 2: Verify the file is valid JSON**

Run: `node -e "require('./vercel.json'); console.log('valid')"`
Expected: `valid`

**Step 3: Commit**

```bash
git add vercel.json
git commit -m "fix: add vercel.json rewrites for SPA routing on refresh"
```

---

## Task 2: Add `explanation` field to all quiz JSON data files

This is a large task — 809 questions across 4 files + 50 guess questions. Each question needs a concise, educational explanation of why the correct answer is right.

**Files:**
- Modify: `src/data/compiler_construction.json` (145 questions)
- Modify: `src/data/freelancing.json` (15 questions + 50 guess_questions)
- Modify: `src/data/information_security_cryptography.json` (359 questions)
- Modify: `src/data/parallel_distributed_computing.json` (240 questions)

**Step 1: Add explanations to `compiler_construction.json`**

For every question object, add an `"explanation"` string field. Example:

```json
{
  "id": 1,
  "text": "A compiler is a program that:",
  "options": [
    "Executes high-level programs directly",
    "Translates a high-level language into machine language",
    "Edits source code",
    "Debugs runtime errors"
  ],
  "correctIndex": 1,
  "explanation": "A compiler translates the entire source code from a high-level programming language into machine code (object code) before execution, unlike an interpreter which executes line by line."
}
```

Each explanation should:
- Be 1-3 sentences
- Explain WHY the correct answer is correct
- Optionally mention why common wrong answers are wrong
- Be educational and concise

**Step 2: Add explanations to `freelancing.json`**

Same format for both `questions` and `guess_questions` arrays.

**Step 3: Add explanations to `information_security_cryptography.json`**

Same format for all 359 questions.

**Step 4: Add explanations to `parallel_distributed_computing.json`**

Same format for all 240 questions.

**Step 5: Validate all JSON files are still valid**

Run: `for f in src/data/*.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('OK: $f')" || echo "FAIL: $f"; done`
Expected: All OK

**Step 6: Commit**

```bash
git add src/data/
git commit -m "feat: add explanation field to all quiz questions across 4 subjects"
```

---

## Task 3: Show explanations in QuizPage after answering

**Files:**
- Modify: `src/components/quiz/QuestionCard.jsx`

**Step 1: Add explanation display below options**

After the options `<div>` (line 43 area), add an explanation card that appears when `isSubmitted` is true and the question has an `explanation` field:

```jsx
{/* Explanation — shown after answering */}
{isSubmitted && question.explanation && (
  <motion.div
    initial={{ opacity: 0, y: 8, height: 0 }}
    animate={{ opacity: 1, y: 0, height: 'auto' }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="mt-4 overflow-hidden"
  >
    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-start gap-2.5">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
          💡
        </span>
        <div>
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">
            Explanation
          </p>
          <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
)}
```

Insert this right before the closing `</motion.div>` of the AnimatePresence wrapper (before line 45).

**Step 2: Verify dev server renders correctly**

Run: `npm run dev`
- Navigate to a quiz, answer a question
- Expected: Explanation card appears below options with smooth animation

**Step 3: Commit**

```bash
git add src/components/quiz/QuestionCard.jsx
git commit -m "feat: show explanation card after answering MCQ on quiz page"
```

---

## Task 4: Show explanations in Analytics QuestionReview

**Files:**
- Modify: `src/components/analytics/QuestionReview.jsx`

**Step 1: Add explanation below options in the expanded review**

In the `ReviewItem` component, after the options `.map()` block (after line 83), add:

```jsx
{/* Explanation */}
{question.explanation && (
  <div className="mt-3 pt-3 border-t border-themed-border">
    <div className="flex items-start gap-2">
      <span className="text-xs">💡</span>
      <div>
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">Explanation</p>
        <p className="text-xs text-content-secondary leading-relaxed">{question.explanation}</p>
      </div>
    </div>
  </div>
)}
```

Insert this after the options map and before the closing `</div>` of `px-4 pb-4` (line 86 area).

**Step 2: Verify**

- Complete a quiz, go to analytics page
- Expand a question in the review section
- Expected: Explanation shows below the option list

**Step 3: Commit**

```bash
git add src/components/analytics/QuestionReview.jsx
git commit -m "feat: show explanation in analytics question review"
```

---

## Task 5: Update upload validator to accept `explanation` field

**Files:**
- Modify: `src/pages/UploadPage.jsx`

**Step 1: Update the EXAMPLE_JSON constant**

In `UploadPage.jsx` line 10-35, update the example JSON to include an `explanation` field in the question:

```json
{
  "id": 1,
  "text": "What is supervised learning?",
  "options": [
    "Learning without labeled data",
    "Learning from labeled input-output pairs",
    "Reinforcement from an environment",
    "Clustering similar data points"
  ],
  "correctIndex": 1,
  "explanation": "Supervised learning uses labeled training data where each input has a known output, allowing the model to learn the mapping function."
}
```

**Step 2: Update the field descriptions grid**

In the grid at line 254-267, add an entry for `explanation`:

```jsx
{ label: 'explanation', desc: 'Optional reason for the correct answer' },
```

**Step 3: Update the AI_PROMPT constant**

Add `"explanation"` field to the question format in the AI prompt, and add a rule:
```
- Each question should have an "explanation" field (1-2 sentences explaining why the correct answer is right)
```

**Step 4: Commit**

```bash
git add src/pages/UploadPage.jsx
git commit -m "feat: update upload example and AI prompt to include explanation field"
```

---

## Task 6: localStorage progress auto-save

**Files:**
- Modify: `src/context/QuizContext.jsx`
- Modify: `src/lib/constants.js`

**Step 1: Add progress key constant**

In `src/lib/constants.js`, add after `SESSION_KEY` (line 15):

```js
export const PROGRESS_KEY_PREFIX = 'quiz-progress-'
```

**Step 2: Add auto-save logic to QuizContext**

In `src/context/QuizContext.jsx`:

a) Import the new constant:
```js
import { SESSION_KEY, PROGRESS_KEY_PREFIX } from '../lib/constants'
```

b) Add a helper function before the `QuizProvider` component:

```js
function saveProgress(state) {
  if (state.status !== 'active' || !state.slug) return
  try {
    localStorage.setItem(PROGRESS_KEY_PREFIX + state.slug, JSON.stringify({
      slug: state.slug,
      subject: state.subject,
      questions: state.questions,
      answers: state.answers,
      currentIndex: state.currentIndex,
      startTime: state.startTime instanceof Date ? state.startTime.toISOString() : state.startTime,
    }))
  } catch { /* localStorage full — silently fail */ }
}

export function clearProgress(slug) {
  localStorage.removeItem(PROGRESS_KEY_PREFIX + slug)
}

export function getSavedProgress(slug) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY_PREFIX + slug)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
```

c) Update `answerQuestion` to auto-save after setting state:

```js
const answerQuestion = useCallback((questionIndex, optionIndex) => {
  setState((prev) => {
    const answers = [...prev.answers]
    answers[questionIndex] = optionIndex
    const next = { ...prev, answers }
    saveProgress(next)
    return next
  })
}, [])
```

d) Update `goToQuestion` to auto-save:

```js
const goToQuestion = useCallback((index) => {
  setState((prev) => {
    const next = { ...prev, currentIndex: index }
    saveProgress(next)
    return next
  })
}, [])
```

e) Update `submitQuiz` to clear progress after submission. After `sessionStorage.removeItem(SESSION_KEY)` (line 113), add:

```js
clearProgress(prev.slug)
```

f) Update `resetQuiz` to also clear progress. Inside the callback, before or after existing removes:

```js
// Need slug before clearing state
setState((prev) => {
  if (prev.slug) clearProgress(prev.slug)
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(ANALYTICS_KEY)
  return INITIAL_STATE
})
```

g) Add a `rehydrateFromProgress` method:

```js
const rehydrateFromProgress = useCallback((saved) => {
  setState({
    subject: saved.subject,
    slug: saved.slug,
    questions: saved.questions,
    answers: saved.answers,
    currentIndex: saved.currentIndex,
    startTime: new Date(saved.startTime),
    status: 'active',
    result: null,
  })
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ slug: saved.slug, startTime: saved.startTime })
  )
}, [])
```

h) Export `rehydrateFromProgress` in the context value alongside other methods.

**Step 3: Commit**

```bash
git add src/context/QuizContext.jsx src/lib/constants.js
git commit -m "feat: add localStorage auto-save for quiz progress"
```

---

## Task 7: Resume/Start Fresh UI on QuizPage

**Files:**
- Modify: `src/pages/QuizPage.jsx`

**Step 1: Import progress helpers and add resume modal**

At the top of `QuizPage.jsx`, add imports:

```js
import { useState } from 'react'
import { getSavedProgress, clearProgress } from '../context/QuizContext'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
```

**Step 2: Add resume detection logic**

Inside the `QuizPage` component, before the existing `useEffect`, add:

```js
const [showResumeModal, setShowResumeModal] = useState(false)
const [savedProgress, setSavedProgress] = useState(null)
```

Modify the existing `useEffect` that handles rehydration (lines 23-35). When `status === 'idle'`, check for saved progress first:

```js
useEffect(() => {
  if (status === 'idle') {
    const subjectData = getSubjectBySlug(slug)
    if (!subjectData) {
      navigate('/', { replace: true })
      return
    }

    // Check for saved progress
    const saved = getSavedProgress(slug)
    if (saved && saved.answers.some(a => a !== null)) {
      setSavedProgress(saved)
      setShowResumeModal(true)
      return
    }

    rehydrate(subjectData, shuffleArray(subjectData.questions))
  }
  if (status === 'completed') {
    navigate('/analytics', { replace: true })
  }
}, [status, slug, navigate, getSubjectBySlug, rehydrate])
```

**Step 3: Add resume/fresh handlers**

```js
function handleResume() {
  rehydrateFromProgress(savedProgress)
  setShowResumeModal(false)
  setSavedProgress(null)
}

function handleStartFresh() {
  clearProgress(slug)
  const subjectData = getSubjectBySlug(slug)
  if (subjectData) {
    rehydrate(subjectData, shuffleArray(subjectData.questions))
  }
  setShowResumeModal(false)
  setSavedProgress(null)
}
```

**Step 4: Add resume modal JSX**

Before the return statement's main content, add the modal:

```jsx
{/* Resume Progress Modal */}
<Modal isOpen={showResumeModal} onClose={handleStartFresh} title="Resume Quiz?">
  <div className="text-center py-4">
    <div className="text-4xl mb-4">📝</div>
    <p className="text-base font-bold text-content-primary mb-2">
      You have saved progress!
    </p>
    <p className="text-sm text-content-secondary mb-1">
      {savedProgress?.answers.filter(a => a !== null).length} of {savedProgress?.questions.length} questions answered
    </p>
    <p className="text-xs text-content-secondary mb-6">
      Would you like to continue where you left off?
    </p>
    <div className="flex gap-3">
      <Button variant="secondary" className="flex-1" onClick={handleStartFresh}>
        Start Fresh
      </Button>
      <Button className="flex-1" onClick={handleResume}>
        Resume Quiz
      </Button>
    </div>
  </div>
</Modal>
```

Also import `rehydrateFromProgress` from `useQuiz()`:

```js
const {
  status, subject, questions, answers, currentIndex,
  answerQuestion, goToQuestion, nextQuestion, prevQuestion, submitQuiz, rehydrate, rehydrateFromProgress,
} = useQuiz()
```

**Step 5: Verify**

- Start a quiz, answer 3 questions, close the browser tab
- Reopen the quiz URL
- Expected: Modal appears showing "3 of N questions answered"
- Click "Resume Quiz" → picks up where you left off
- Click "Start Fresh" → new quiz with fresh shuffled questions

**Step 6: Commit**

```bash
git add src/pages/QuizPage.jsx
git commit -m "feat: add resume/start-fresh modal for saved quiz progress"
```

---

## Task 8: Install React Bits components

**Files:**
- Create: `src/components/reactbits/ShinyText.jsx`
- Create: `src/components/reactbits/BlurText.jsx`
- Create: `src/components/reactbits/DecryptedText.jsx`
- Create: `src/components/reactbits/CountUp.jsx`
- Create: `src/components/reactbits/ClickSpark.jsx`
- Create: `src/components/reactbits/StarBorder.jsx`
- Create: `src/components/reactbits/TiltedCard.jsx`
- Create: `src/components/reactbits/Squares.jsx`
- Create: `src/components/reactbits/AnimatedContent.jsx`

**Step 1: Fetch each component from reactbits.dev**

For each component, visit the reactbits.dev page and copy the **JavaScript + Tailwind** variant. Save each into `src/components/reactbits/` directory.

Components to fetch:
1. **ShinyText** — for navbar app name shimmer
2. **BlurText** — for hero section title animation
3. **DecryptedText** — for quiz question text reveal
4. **CountUp** — for score and stats counters
5. **ClickSpark** — for answer selection sparks
6. **StarBorder** — for primary CTA button borders
7. **TiltedCard** — for 3D subject card hover
8. **Squares** — for animated background
9. **AnimatedContent** — for explanation reveal

**Step 2: Verify imports work**

Run: `npm run dev`
Expected: No import errors

**Step 3: Commit**

```bash
git add src/components/reactbits/
git commit -m "feat: add React Bits animated components (ShinyText, BlurText, etc.)"
```

---

## Task 9: Integrate React Bits — Navbar (ShinyText)

**Files:**
- Modify: `src/components/layout/Navbar.jsx`

**Step 1: Replace "Quiz Slayer" text with ShinyText**

Import ShinyText:
```js
import ShinyText from '../reactbits/ShinyText'
```

Replace the static text span (lines 157-163) with:

```jsx
<span className="font-black text-lg tracking-tight">
  Quiz{' '}
  <ShinyText text="Slayer" speed={3} className="font-black" />
</span>
```

**Step 2: Verify** — navbar should show shimmering "Slayer" text

**Step 3: Commit**

```bash
git add src/components/layout/Navbar.jsx
git commit -m "feat: add ShinyText effect to navbar app name"
```

---

## Task 10: Integrate React Bits — Landing Hero (BlurText + Squares)

**Files:**
- Modify: `src/components/landing/HeroSection.jsx`
- Modify: `src/pages/LandingPage.jsx`

**Step 1: Add Squares background to LandingPage**

Import Squares:
```js
import Squares from '../components/reactbits/Squares'
```

Wrap the LandingPage content with a positioned container that has Squares as a background:

```jsx
<div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-4">
  {/* Animated background */}
  <div className="fixed inset-0 -z-10 pointer-events-none">
    <Squares speed={0.15} squareSize={40} direction="diagonal" borderColor="rgb(var(--border) / 0.3)" hoverFillColor="rgb(var(--accent) / 0.06)" />
  </div>

  {/* ...rest of existing content... */}
</div>
```

**Step 2: Replace hero heading with BlurText**

Import BlurText in HeroSection:
```js
import BlurText from '../reactbits/BlurText'
```

Replace the static heading text (lines 146-181) with a BlurText version. The heading "Study Smarter, Not Harder" should use BlurText for the reveal animation while keeping the accent color on "Smarter".

**Step 3: Verify** — landing page should have animated squares background and blur-reveal hero text

**Step 4: Commit**

```bash
git add src/components/landing/HeroSection.jsx src/pages/LandingPage.jsx
git commit -m "feat: add Squares background and BlurText hero animation"
```

---

## Task 11: Integrate React Bits — Subject Cards (TiltedCard)

**Files:**
- Modify: `src/components/landing/SubjectCard.jsx`

**Step 1: Wrap SubjectCard content with TiltedCard**

Import TiltedCard:
```js
import TiltedCard from '../reactbits/TiltedCard'
```

Wrap the card's inner content with TiltedCard for 3D hover tilt effect. Keep the existing styling and click handler, but add the tilt interaction.

**Step 2: Verify** — subject cards should tilt in 3D on hover

**Step 3: Commit**

```bash
git add src/components/landing/SubjectCard.jsx
git commit -m "feat: add TiltedCard 3D hover effect to subject cards"
```

---

## Task 12: Integrate React Bits — Quiz Page (DecryptedText + ClickSpark)

**Files:**
- Modify: `src/components/quiz/QuestionCard.jsx`
- Modify: `src/components/quiz/OptionButton.jsx`

**Step 1: Add DecryptedText to question text**

Import DecryptedText in QuestionCard:
```js
import DecryptedText from '../reactbits/DecryptedText'
```

Replace the question text `<h2>` content (line 25-27) with:

```jsx
<DecryptedText
  text={question.text}
  speed={40}
  maxIterations={8}
  revealDirection="start"
  className="text-xl sm:text-2xl font-bold text-content-primary leading-snug"
/>
```

**Step 2: Add ClickSpark to OptionButton**

Import ClickSpark in OptionButton:
```js
import ClickSpark from '../reactbits/ClickSpark'
```

Wrap the entire `<motion.button>` return with `<ClickSpark>`:

```jsx
return (
  <ClickSpark sparkColor="rgb(var(--accent))" sparkCount={6} sparkSize={8}>
    <motion.button ...>
      {/* existing content */}
    </motion.button>
  </ClickSpark>
)
```

**Step 3: Verify** — questions should decrypt-reveal, clicking options should spark

**Step 4: Commit**

```bash
git add src/components/quiz/QuestionCard.jsx src/components/quiz/OptionButton.jsx
git commit -m "feat: add DecryptedText questions and ClickSpark answer effects"
```

---

## Task 13: Integrate React Bits — Analytics Page (CountUp)

**Files:**
- Modify: `src/components/analytics/ScoreSummary.jsx`
- Modify: `src/pages/HistoryPage.jsx`

**Step 1: Add CountUp to score display**

Import CountUp in ScoreSummary:
```js
import CountUp from '../reactbits/CountUp'
```

Replace the static `{score}%` text in the animated circle (line 53) with:

```jsx
<CountUp from={0} to={score} duration={1.2} className="text-3xl font-black text-content-primary" />
<span className="text-3xl font-black text-content-primary">%</span>
```

Also use CountUp for the correct/wrong/time stats row numbers.

**Step 2: Add CountUp to HistoryPage stats**

Import CountUp in HistoryPage and replace static numbers in the stats grid (lines 68-74):

```jsx
<CountUp from={0} to={totalAttempts} duration={0.8} className="text-3xl font-black text-content-primary" />
```

```jsx
<CountUp from={0} to={avgScore} duration={0.8} className="text-3xl font-black text-themed-accent" />
<span className="text-3xl font-black text-themed-accent">%</span>
```

**Step 3: Verify** — scores should count up on analytics and history pages

**Step 4: Commit**

```bash
git add src/components/analytics/ScoreSummary.jsx src/pages/HistoryPage.jsx
git commit -m "feat: add CountUp animations to score displays"
```

---

## Task 14: Integrate React Bits — Star Border buttons

**Files:**
- Modify: `src/pages/LandingPage.jsx` (or wherever primary CTAs live)
- Modify: `src/components/quiz/QuizSetupModal.jsx`

**Step 1: Add StarBorder to "Start Quiz" button in QuizSetupModal**

Import StarBorder:
```js
import StarBorder from '../reactbits/StarBorder'
```

Wrap the "Start Quiz →" button with StarBorder for an animated border effect on the primary CTA.

**Step 2: Verify** — Start Quiz button should have animated star border

**Step 3: Commit**

```bash
git add src/components/quiz/QuizSetupModal.jsx
git commit -m "feat: add StarBorder effect to Start Quiz button"
```

---

## Task 15: Final verification and cleanup

**Step 1: Run the build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Run the preview**

Run: `npm run preview`
- Test all pages work
- Test quiz flow end-to-end
- Test progress save/resume
- Test explanations display
- Test React Bits animations render

**Step 3: Run lint**

Run: `npm run lint`
Expected: No errors (warnings OK)

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification for feature expansion"
```
