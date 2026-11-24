export const photoExtensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

export type PhotoType = keyof typeof photoExtensions

interface ImageEdit {
  photo: Blob
  photoType: PhotoType
  prompt: string
}

interface EditUsage {
  inputTokens?: number
  outputTokens?: number
  imageInputTokens?: number
  textInputTokens?: number
}

export interface ImageEditResult {
  imageUrl: string
  usage: EditUsage
}

interface OpenAIImageResponse {
  data?: { b64_json?: unknown }[]
  usage?: {
    input_tokens?: number
    output_tokens?: number
    input_tokens_details?: { image_tokens?: number; text_tokens?: number }
  }
}

const diagnosticCodes = new Set([
  'invalid_api_key',
  'insufficient_quota',
  'billing_hard_limit_reached',
  'model_not_found',
  'rate_limit_exceeded',
  'organization_verification_required',
  'content_policy_violation',
])

export class ImageProviderError extends Error {
  constructor(readonly providerStatus: number, readonly providerCode?: string) {
    super('El proveedor rechazó la edición.')
  }
}

export function createImageEditor(apiKey: string, send: typeof fetch = fetch) {
  return async ({ photo, photoType, prompt }: ImageEdit, signal: AbortSignal): Promise<ImageEditResult> => {
    const form = new FormData()
    form.set('model', 'gpt-image-2.6-flare')
    form.set('image[]', photo, `referencia.${photoExtensions[photoType]}`)
    form.set('prompt', prompt)
    form.set('size', '1024x1536')
    form.set('quality', 'medium')
    form.set('n', '1')
    form.set('output_format', 'jpeg')
    const response = await send('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal,
      redirect: 'error',
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: { code?: unknown } } | null
      const code = body?.error?.code
      throw new ImageProviderError(response.status, typeof code === 'string' && diagnosticCodes.has(code) ? code : undefined)
    }

    const { data, usage } = await response.json() as OpenAIImageResponse
    const image = data?.[0]?.b64_json
    if (typeof image !== 'string' || !image) throw new Error('El proveedor devolvió una imagen vacía.')
    return {
      imageUrl: `data:image/jpeg;base64,${image}`,
      usage: {
        inputTokens: usage?.input_tokens,
        outputTokens: usage?.output_tokens,
        imageInputTokens: usage?.input_tokens_details?.image_tokens,
        textInputTokens: usage?.input_tokens_details?.text_tokens,
      },
    }
  }
}
