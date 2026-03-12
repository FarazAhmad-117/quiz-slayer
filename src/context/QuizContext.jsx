import { createContext, useCallback, useState } from 'react'
import { SESSION_KEY } from '../lib/constants'
import { saveQuizResult } from '../lib/db'

export const QuizContext = createContext(null)

const ANALYTICS_KEY = 'quiz-analytics'

const INITIAL_STATE = {
  subject: null,
  slug: null,
  questions: [],
  answers: [],
  currentIndex: 0,
  startTime: null,
  status: 'idle', // 'idle' | 'active' | 'completed'
  result: null,
}

export function QuizProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE)

  /** Start a new quiz session */
  const startQuiz = useCallback((subjectMeta, questions) => {
    const startTime = new Date()
    const newState = {
      subject: subjectMeta.subject,
      slug: subjectMeta.slug,
      questions,
      answers: new Array(questions.length).fill(null),
      currentIndex: 0,
      startTime,
      status: 'active',
      result: null,
    }
    setState(newState)
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ slug: subjectMeta.slug, startTime: startTime.toISOString() })
    )
    // Clear any previous analytics snapshot so stale data doesn't bleed through
    sessionStorage.removeItem(ANALYTICS_KEY)
  }, [])

  /** Record user's answer for a question index */
  const answerQuestion = useCallback((questionIndex, optionIndex) => {
    setState((prev) => {
      const answers = [...prev.answers]
      answers[questionIndex] = optionIndex
      return { ...prev, answers }
    })
  }, [])

  const goToQuestion = useCallback((index) => {
    setState((prev) => ({ ...prev, currentIndex: index }))
  }, [])

  const nextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1),
    }))
  }, [])

  const prevQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }))
  }, [])

  /** Calculate result and persist to IndexedDB */
  const submitQuiz = useCallback(() => {
    // didSave guards against React 18 StrictMode double-invoking the setState updater
    let didSave = false
    let analyticsSnapshot = null

    setState((prev) => {
      if (prev.status !== 'active') return prev

      const correct = prev.questions.reduce((acc, q, i) => {
        return acc + (prev.answers[i] === q.correctIndex ? 1 : 0)
      }, 0)
      const total = prev.questions.length
      const score = Math.round((correct / total) * 100)
      const timeTaken = Math.round((new Date() - new Date(prev.startTime)) / 1000)

      const result = { correct, total, score, timeTaken }

      // Capture snapshot for sessionStorage (runs outside setState below)
      analyticsSnapshot = {
        result,
        subject: prev.subject,
        questions: prev.questions,
        answers: prev.answers,
      }

      // Guard prevents double-saving in StrictMode (updater is called twice but
      // didSave persists in the closure across both invocations)
      if (!didSave) {
        didSave = true
        saveQuizResult({
          subject: prev.subject,
          slug: prev.slug,
          score,
          correct,
          total,
          answers: prev.answers,
          timeTaken,
        })
      }

      sessionStorage.removeItem(SESSION_KEY)
      return { ...prev, status: 'completed', result }
    })

    // Persist analytics data so the page survives navigation and refresh
    if (analyticsSnapshot) {
      sessionStorage.setItem(ANALYTICS_KEY, JSON.stringify(analyticsSnapshot))
    }
  }, [])

  const resetQuiz = useCallback(() => {
    setState(INITIAL_STATE)
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(ANALYTICS_KEY)
  }, [])

  /** Re-hydrate from subject data after page refresh on /quiz/:slug */
  const rehydrate = useCallback((subjectMeta, questions) => {
    const sessionRaw = sessionStorage.getItem(SESSION_KEY)
    const session = sessionRaw ? JSON.parse(sessionRaw) : null
    const startTime = session?.startTime ? new Date(session.startTime) : new Date()

    setState({
      subject: subjectMeta.subject,
      slug: subjectMeta.slug,
      questions,
      answers: new Array(questions.length).fill(null),
      currentIndex: 0,
      startTime,
      status: 'active',
      result: null,
    })
  }, [])

  return (
    <QuizContext.Provider
      value={{
        ...state,
        startQuiz,
        answerQuestion,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        submitQuiz,
        resetQuiz,
        rehydrate,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}
