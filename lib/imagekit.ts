import { upload } from '@imagekit/next'

import type { ProductImage } from '@/lib/supabase'

// ============================================================================
// IMAGEKIT — CLIENT-SAFE HELPERS (browser)
// ----------------------------------------------------------------------------
// The browser never sees the private key: it asks /api/admin/imagekit-auth for
// a short-lived signature, then posts the file straight to ImageKit's upload
// endpoint. Uploading from the browser (rather than through a server action)
// bypasses the serverless request-body limit, so 10 MB files work.
// ============================================================================

/**
 * SVG is deliberately excluded: it is an XML document that can carry scripts,
 * and these CDN URLs are rendered as <img src>. Rejecting it keeps stored
 * uploads from becoming a stored-XSS vector.
 */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',')

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/** Human-readable upload rules, reused by the form's hint text. */
export const IMAGE_RULES_TEXT = 'JPEG, PNG, WebP or AVIF · up to 10 MB each · up to 6 images.'

/** Returns an error message, or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return `${file.name}: only JPEG, PNG, WebP and AVIF images are supported.`
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: ${(file.size / 1024 / 1024).toFixed(1)} MB is over the 10 MB limit.`
  }
  return null
}

/**
 * ImageKit replaces characters outside `a-z A-Z 0-9 . -` with `_`. Sanitising
 * first keeps the resulting CDN path predictable and free of percent-encoding.
 */
export function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const extension = dot > 0 ? name.slice(dot + 1) : ''
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
  const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9]+/g, '')

  return `${clean || 'product'}.${cleanExtension || 'jpg'}`
}

/**
 * Append the house transformation (`?tr=w-1200,f-auto,q-70`) to a stored URL.
 * Mirrors the convention used by the showroom so CDN responses stay consistent.
 */
export function productImageUrl(url: string, width = 1200): string {
  if (url.includes('tr=')) return url
  const transformation = `tr=w-${width},f-auto,q-70`
  return url.includes('?') ? `${url}&${transformation}` : `${url}?${transformation}`
}

type UploadOptions = {
  signal?: AbortSignal
  onProgress?: (loaded: number, total: number) => void
}

/**
 * Validate-free upload: callers run `validateImageFile` first. Throws an Error
 * with a readable message on any failure so the caller can show it inline.
 */
export async function uploadProductImage(
  file: File,
  options: UploadOptions = {},
  folder: string = 'products',
): Promise<ProductImage> {
  const authResponse = await fetch(`/api/admin/imagekit-auth?folder=${encodeURIComponent(folder)}`, { method: 'POST' })

  if (!authResponse.ok) {
    const body = (await authResponse.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? 'Could not authorise the upload. Sign in again and retry.')
  }

  const auth = (await authResponse.json()) as {
    token: string
    signature: string
    expire: number
    publicKey: string
    folder: string
  }

  const response = await upload({
    file,
    fileName: sanitizeFileName(file.name),
    token: auth.token,
    expire: auth.expire,
    publicKey: auth.publicKey,
    signature: auth.signature,
    folder: auth.folder,
    useUniqueFileName: true,
    abortSignal: options.signal,
    onProgress: (event) => options.onProgress?.(event.loaded, event.total ?? 0),
  })

  if (!response.url) {
    throw new Error('ImageKit accepted the upload but returned no URL — check the URL endpoint setting.')
  }

  return {
    url: response.url,
    fileId: response.fileId ?? null,
    name: response.name ?? file.name,
    width: response.width ?? null,
    height: response.height ?? null,
  }
}