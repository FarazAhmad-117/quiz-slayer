import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { QuizProgressBar } from '../components/quiz/QuizProgressBar'
import { QuizNavigation } from '../components/quiz/QuizNavigation'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useQuiz } from '../hooks/useQuiz'
import { useSubjectData } from '../hooks/useSubjectData'
import { shuffleArray } from '../lib/utils'
import { getColorClasses } from '../lib/constants'
import { getSubjectColor } from '../lib/subjectUtils'
import { cn } from '../lib/utils'
import { getSavedProgress, clearProgress } from '../context/QuizContext'
import DecryptedText from '../components/reactbits/DecryptedText'
import ClickSpark from '../components/reactbits/ClickSpark'
import StarBorder from '../components/reactbits/StarBorder'

export function QuizPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const {
    status, subject, questions, answers, currentIndex,
    answerQuestion, goToQuestion, nextQuestion, prevQuestion, submitQuiz, rehydrate, rehydrateFromProgress,
  } = useQuiz()
  const { getSubjectBySlug } = useSubjectData()

  const [showResumeModal, setShowResumeModal] = useState(false)
  const [savedProgress, setSavedProgress] = useState(null)

  // Scroll to top when quiz starts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Re-hydrate quiz if user refreshed the page
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

  if (showResumeModal) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
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
              <StarBorder className="flex-1" color="rgb(var(--accent))" speed="5s">
                <Button className="w-full" onClick={handleResume}>
                  Resume Quiz
                </Button>
              </StarBorder>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  if (status !== 'active' || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-content-secondary">
          <p className="text-lg font-semibold">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentIndex] ?? null
  const isLastQuestion = currentIndex === questions.length - 1
  const answeredCount = answers.filter((a) => a !== null).length
  const subjectData = getSubjectBySlug(slug)
  const c = getColorClasses(getSubjectColor(slug ?? ''))

  function handleSubmit() {
    submitQuiz()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Subject header */}
      <div className="flex items-center justify-between mb-6">
        <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold', c.badge, c.badgeDark, c.text, c.textDark)}>
          <span>{subjectData?.icon}</span>
          <DecryptedText text={subject || ''} speed={40} maxIterations={8} animateOn="view" className="font-bold" />
        </div>
        <Link
          to="/"
          className="text-xs text-content-secondary hover:text-content-primary transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit
        </Link>
      </div>

      {/* Card — ClickSpark fires particles on every click (answer selection) */}
      <ClickSpark sparkColor="rgb(var(--accent))" sparkSize={12} sparkRadius={30} sparkCount={10} duration={500}>
        <div className="card p-6 sm:p-8">
          <QuizProgressBar
            current={currentIndex + 1}
            total={questions.length}
            answeredCount={answeredCount}
          />

          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedIndex={currentAnswer}
            isSubmitted={currentAnswer !== null}
            onSelect={(i) => answerQuestion(currentIndex, i)}
          />

          <QuizNavigation
            currentIndex={currentIndex}
            total={questions.length}
            selectedIndex={currentAnswer}
            isLastQuestion={isLastQuestion}
            onPrev={prevQuestion}
            onNext={nextQuestion}
            onSubmit={handleSubmit}
          />
        </div>
      </ClickSpark>

      {/* Question palette */}
      {questions.length > 1 && (
        <div className="mt-4 card p-4">
          <p className="text-xs text-content-secondary font-semibold mb-3">Question Palette</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => goToQuestion(i)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                  i === currentIndex
                    ? 'bg-themed-accent text-white shadow-md'
                    : answers[i] !== null
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                      : 'bg-surface-secondary text-content-secondary hover:bg-themed-accent/10 hover:text-themed-accent'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
