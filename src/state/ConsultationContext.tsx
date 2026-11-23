import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ConsultationInput } from '../domain/types'

interface ConsultationState {
  criteria: Partial<ConsultationInput>
  photo: File | null
  updateCriteria: (patch: Partial<ConsultationInput>) => void
  setPhoto: (file: File | null) => void
  reset: () => void
}

const ConsultationContext = createContext<ConsultationState | undefined>(undefined)

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [criteria, setCriteria] = useState<Partial<ConsultationInput>>({})
  const [photo, setPhoto] = useState<File | null>(null)
  const updateCriteria = useCallback((patch: Partial<ConsultationInput>) => {
    setCriteria(current => ({ ...current, ...patch }))
  }, [])
  const reset = useCallback(() => {
    setCriteria({})
    setPhoto(null)
  }, [])
  const value = useMemo(() => ({ criteria, photo, updateCriteria, setPhoto, reset }),
    [criteria, photo, updateCriteria, reset])

  return <ConsultationContext.Provider value={value}>{children}</ConsultationContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- API del contexto compartido.
export function useConsultation(): ConsultationState {
  const context = useContext(ConsultationContext)
  if (!context) throw new Error('useConsultation debe usarse dentro de ConsultationProvider')
  return context
}
