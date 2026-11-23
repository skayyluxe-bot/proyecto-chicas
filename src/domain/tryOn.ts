export const tryOnPath = 'api/try-on'

export const tryOnHeaders = {
  consent: 'x-try-on-consent',
  outfit: 'x-try-on-outfit',
  makeup: 'x-try-on-makeup',
  mode: 'x-try-on-mode',
} as const

export type TryOnMode = 'disabled' | 'simulated' | 'openai'

export interface TryOnResult {
  imageUrl: string
  simulated: boolean
}
