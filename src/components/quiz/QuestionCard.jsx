import { AnimatePresence, motion } from 'framer-motion'
import { OptionButton } from './OptionButton'

export function QuestionCard({
  question,
  questionNumber,
  selectedIndex,
  isSubmitted,
  onSelect,
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Question text */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-content-secondary uppercase tracking-wide mb-3">
            Question {questionNumber}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary leading-snug">
            {question.text}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <OptionButton
              key={i}
              option={option}
              index={i}
              selectedIndex={selectedIndex}
              correctIndex={question.correctIndex}
              isSubmitted={isSubmitted}
              onClick={() => onSelect(i)}
            />
          ))}
        </div>

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
                  <div className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed space-y-2">
                    {question.explanation.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </motion.div>
    </AnimatePresence>
  )
}
