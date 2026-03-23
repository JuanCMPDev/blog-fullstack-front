import { useCallback, useMemo, useState } from 'react'
import {
  completeMediaUpload,
  initMediaUpload,
  type MediaResource,
  type NormalizedMediaAsset,
} from '@/lib/media-client'
import { customFetch } from '@/lib/customFetch'
import { normalizeFallbackUploadResponse } from '@/lib/upload-fallback-adapter'
import {
  validateMediaDescriptor,
  type MediaValidationRules,
  type MediaValidationResult,
} from '@/lib/media-validation'

export type MediaUploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UseMediaUploadParams {
  resource: MediaResource
  rules: MediaValidationRules
}

interface UploadMediaOptions {
  durationSec?: number
}

export interface UseMediaUploadReturn {
  status: MediaUploadStatus
  isUploading: boolean
  error: string | null
  progress: number
  upload: (file: File, options?: UploadMediaOptions) => Promise<NormalizedMediaAsset>
  validate: (file: File, options?: UploadMediaOptions) => MediaValidationResult
  reset: () => void
}

type BackendUploadPayload = {
  asset?: {
    key?: string
    url?: string
    mimeType?: string
    type?: string
    size?: number
    width?: number
    height?: number
    durationSec?: number
  }
  imageUrl?: string
  url?: string
  key?: string
}

function uploadBinaryWithProgress(params: {
  url: string
  method: 'PUT' | 'POST'
  headers?: Record<string, string>
  file: File
  onProgress: (progress: number) => void
}): Promise<void> {
  const { url, method, headers, file, onProgress } = params

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)

    Object.entries(headers || {}).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return
      }

      const rawPercent = (event.loaded / event.total) * 100
      const boundedPercent = Math.max(0, Math.min(100, rawPercent))
      onProgress(boundedPercent)
    }

    xhr.onerror = () => {
      reject(new Error('No se pudo subir el archivo al storage'))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }

      reject(new Error(`Upload falló con status ${xhr.status}`))
    }

    xhr.send(file)
  })
}

async function uploadViaBackendFallback(file: File, resource: MediaResource): Promise<NormalizedMediaAsset> {
  const formData = new FormData()
  formData.append('resource', resource)
  formData.append('file', file)
  formData.append('image', file)

  const legacyResponse = await customFetch('posts/upload', {
    method: 'POST',
    body: formData,
  })

  if (!legacyResponse.ok) {
    throw new Error(`No se pudo subir ${resource} por fallback backend`)
  }

  const payload = (await legacyResponse.json()) as BackendUploadPayload
  return normalizeFallbackUploadResponse(payload, file, resource)
}

export function useMediaUpload({ resource, rules }: UseMediaUploadParams): UseMediaUploadReturn {
  const [status, setStatus] = useState<MediaUploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const validate = useCallback(
    (file: File, options?: UploadMediaOptions) => {
      return validateMediaDescriptor(
        {
          mimeType: file.type,
          size: file.size,
          durationSec: options?.durationSec,
        },
        rules
      )
    },
    [rules]
  )

  const upload = useCallback(
    async (file: File, options?: UploadMediaOptions): Promise<NormalizedMediaAsset> => {
      setError(null)
      setProgress(0)

      const validation = validate(file, options)
      if (!validation.ok) {
        const firstError = validation.errors[0] || 'Archivo inválido'
        setStatus('error')
        setError(firstError)
        throw new Error(firstError)
      }

      try {
        setStatus('uploading')

        const initPayload = await initMediaUpload({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          resource,
        })

        setProgress(5)

        await uploadBinaryWithProgress({
          url: initPayload.uploadUrl,
          method: initPayload.method,
          headers: initPayload.headers,
          file,
          onProgress: (uploadPercent) => {
            // Reservamos 0-90% para transferencia binaria y 90-100% para complete
            const mappedProgress = 5 + uploadPercent * 0.85
            setProgress(Math.round(mappedProgress))
          },
        })

        setProgress(92)

        const completed = await completeMediaUpload({
          uploadId: initPayload.uploadId,
          key: initPayload.key,
        })

        setProgress(100)
        setStatus('success')
        return completed.asset
      } catch (uploadError) {
        try {
          const fallbackAsset = await uploadViaBackendFallback(file, resource)
          setProgress(100)
          setStatus('success')
          return fallbackAsset
        } catch (legacyError) {
          const legacyMessage =
            legacyError instanceof Error
              ? legacyError.message
              : 'Error al subir media (falló upload directo y fallback)'

          setStatus('error')
          setError(legacyMessage)
          setProgress(0)
          throw legacyError
        }
      }
    },
    [resource, validate]
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setProgress(0)
  }, [])

  return useMemo(
    () => ({
      status,
      isUploading: status === 'uploading',
      error,
      progress,
      upload,
      validate,
      reset,
    }),
    [status, error, progress, upload, validate, reset]
  )
}
