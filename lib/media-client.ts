import { extractApiErrorMessageFromResponse } from './api'
import { customFetch } from './customFetch'

export type MediaResource = 'post-image' | 'post-video' | 'post-video-poster'

export interface NormalizedMediaAsset {
  url: string
  key: string
  width?: number
  height?: number
  type: string
  size?: number
  durationSec?: number
}

export interface InitMediaUploadInput {
  fileName: string
  mimeType: string
  size: number
  resource: MediaResource
}

export interface InitMediaUploadResponse {
  uploadId: string
  method: 'PUT' | 'POST'
  uploadUrl: string
  headers?: Record<string, string>
  key: string
  expiresInSec: number
}

export interface CompleteMediaUploadInput {
  uploadId: string
  key: string
}

export interface CompleteMediaUploadResponse {
  asset: NormalizedMediaAsset
}

export interface GetMediaAssetMetadataResponse {
  asset: NormalizedMediaAsset
}

type RawMediaAsset = {
  url: string
  key: string
  width?: number
  height?: number
  type?: string
  mimeType?: string
  size?: number
  durationSec?: number
}

type RawInitMediaUploadResponse = {
  uploadId: string
  method: string
  uploadUrl: string
  headers?: Record<string, string>
  key: string
  expiresInSec: number
}

function normalizeUploadMethod(method: string): 'PUT' | 'POST' {
  const normalized = method.toUpperCase()
  if (normalized === 'POST') return 'POST'
  return 'PUT'
}

function normalizeMediaAsset(asset: RawMediaAsset): NormalizedMediaAsset {
  return {
    url: asset.url,
    key: asset.key,
    width: asset.width,
    height: asset.height,
    type: asset.type || asset.mimeType || 'application/octet-stream',
    size: asset.size,
    durationSec: asset.durationSec,
  }
}

async function parseJsonOrThrow<T>(response: Response, fallbackError: string): Promise<T> {
  if (!response.ok) {
    const message = await extractApiErrorMessageFromResponse(response, fallbackError)
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function initMediaUpload(input: InitMediaUploadInput): Promise<InitMediaUploadResponse> {
  const response = await customFetch('media/uploads/init', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const payload = await parseJsonOrThrow<RawInitMediaUploadResponse>(
    response,
    'No se pudo iniciar el upload de media'
  )

  return {
    ...payload,
    method: normalizeUploadMethod(payload.method),
  }
}

export async function completeMediaUpload(
  input: CompleteMediaUploadInput
): Promise<CompleteMediaUploadResponse> {
  const response = await customFetch('media/uploads/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const payload = await parseJsonOrThrow<{ asset: RawMediaAsset }>(
    response,
    'No se pudo completar el upload de media'
  )

  return { asset: normalizeMediaAsset(payload.asset) }
}

export async function deleteMediaAsset(key: string): Promise<boolean> {
  const encodedKey = encodeURIComponent(key)
  const response = await customFetch(`media/${encodedKey}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const message = await extractApiErrorMessageFromResponse(response, 'No se pudo eliminar el asset')
    throw new Error(message)
  }

  return true
}

export async function getMediaAssetMetadata(key: string): Promise<GetMediaAssetMetadataResponse> {
  const encodedKey = encodeURIComponent(key)
  const response = await customFetch(`media/${encodedKey}/metadata`, {
    method: 'GET',
  })

  const payload = await parseJsonOrThrow<{ asset: RawMediaAsset }>(
    response,
    'No se pudo obtener metadata del asset'
  )

  return { asset: normalizeMediaAsset(payload.asset) }
}
