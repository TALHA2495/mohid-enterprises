import { getUploadAuthParams } from '@imagekit/next/server'

// ============================================================================
// IMAGEKIT — SERVER-ONLY HELPERS (private key)
// ----------------------------------------------------------------------------
// NEVER import this module from a client component ('use client'). The private
// key signs uploads and authorises deletes; it must never reach the browser.
// The browser only ever receives a short-lived signature.
// ============================================================================

if (typeof window !== 'undefined') {
  throw new Error(
    'lib/imagekit.server.ts imported on the client — the ImageKit private key must never be exposed to the browser. Use lib/imagekit.ts instead.',
  )
}

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

/** Folder every product upload lands in (ImageKit creates it if absent). */
export const PRODUCT_IMAGE_FOLDER = 'products'

/** Names (never values) of the variables this module needs but did not receive. */
export const missingImagekitEnvVars: string[] = [
  ...(privateKey ? [] : ['IMAGEKIT_PRIVATE_KEY']),
  ...(publicKey ? [] : ['NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY']),
  ...(urlEndpoint ? [] : ['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT']),
]

export const isImagekitConfigured = missingImagekitEnvVars.length === 0

export type UploadAuth = {
  token: string
  signature: string
  expire: number
  publicKey: string
  folder: string
}

/**
 * Short-lived upload credentials for a browser-side upload.
 * `expire` is a unix timestamp; ImageKit requires it under an hour ahead.
 * Returns null when the environment is incomplete, so the caller can surface a
 * setup message instead of throwing a 500.
 */
export function createUploadAuth(): UploadAuth | null {
  if (!privateKey || !publicKey) return null

  const { token, signature, expire } = getUploadAuthParams({ privateKey, publicKey })
  return { token, signature, expire, publicKey, folder: PRODUCT_IMAGE_FOLDER }
}

/**
 * Remove an uploaded file from the ImageKit media library.
 *
 * Called only for images this app uploaded (an `images` entry with a `fileId`);
 * showroom-seeded entries carry `fileId: null` and are never deleted remotely.
 * Best-effort by contract — a failed delete must not block saving a product.
 */
export async function deleteImageKitFile(fileId: string): Promise<{ ok: boolean; error?: string }> {
  if (!privateKey) return { ok: false, error: 'IMAGEKIT_PRIVATE_KEY is not set on the server.' }

  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: {
        // ImageKit Media API: HTTP Basic with the private key and an empty password.
        Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const body = await response.text()
      return { ok: false, error: `ImageKit responded ${response.status}: ${body.slice(0, 200)}` }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error deleting from ImageKit.' }
  }
}