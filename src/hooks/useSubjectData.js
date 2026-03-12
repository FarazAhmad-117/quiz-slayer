import { useMemo, useState, useEffect, useCallback } from 'react'
import { getAllCustomSubjects } from '../lib/db'

const modules = import.meta.glob('../data/*.json', { eager: true })

function processRaw(data, isCustom = false) {
  return {
    subject: data.subject,
    slug: data.slug,
    description: data.description ?? '',
    questionCount: data.questions?.length ?? 0,
    questions: data.questions ?? [],
    guessQuestions: data.guess_questions ?? [],
    isCustom,
  }
}

export function useSubjectData() {
  const [customSubjects, setCustomSubjects] = useState([])

  const loadCustom = useCallback(async () => {
    const entries = await getAllCustomSubjects()
    setCustomSubjects(entries)
  }, [])

  useEffect(() => {
    loadCustom()
  }, [loadCustom])

  const fileSubjects = useMemo(() => {
    return Object.entries(modules)
      .map(([, module]) => processRaw(module.default ?? module, false))
      .sort((a, b) => a.subject.localeCompare(b.subject))
  }, [])

  // Slugs present in built-in files (custom subjects with same slug are skipped)
  const builtInSlugs = useMemo(() => new Set(fileSubjects.map((s) => s.slug)), [fileSubjects])

  const subjects = useMemo(() => {
    const custom = customSubjects
      .filter((s) => !builtInSlugs.has(s.slug))
      .map((s) => processRaw(s, true))
    return [...fileSubjects, ...custom].sort((a, b) => a.subject.localeCompare(b.subject))
  }, [fileSubjects, customSubjects, builtInSlugs])

  function getSubjectBySlug(slug) {
    return subjects.find((s) => s.slug === slug) ?? null
  }

  return { subjects, getSubjectBySlug, builtInSlugs, reloadCustom: loadCustom }
}
