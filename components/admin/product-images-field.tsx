'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useTransition } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'

import { deleteUploadedImage } from '@/app/admin/actions'
import { ACCEPT_ATTRIBUTE, IMAGE_RULES_TEXT, productImageUrl, uploadProductImage, validateImageFile } from '@/lib/imagekit'
import { MAX_IMAGES } from '@/lib/product-schema'
import type { ProductImage } from '@/lib/supabase'

// ============================================================================
// PRODUCT IMAGES FIELD — add, preview, remove gallery images
// ----------------------------------------------------------------------------
// Files are validated in the browser (type + 10 MB) and posted straight to
// ImageKit with a short-lived signature, so they never pass through a serverless
// function (which would cap the body at a few MB). Only the resulting
// { url, fileId, … } lands in Supabase.
//
// Removing an image that this app uploaded also deletes it from the CDN;
// showroom-seeded images have `fileId: null` and are only detached, never
// deleted remotely.
// ============================================================================

type PendingUpload = { id: string; name: string; previewUrl: string; progress: number }

type Props = {
  value: ProductImage[]
  onChange: (images: ProductImage[]) => void
  disabled?: boolean
}

export default function ProductImagesField({ value, onChange, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrls = useRef<string[]>([])
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [error, setError] = useState('')
  const [isRemoving, startRemoval] = useTransition()

  // Object URLs are leaked memory until revoked — release them on unmount too.
  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
      previewUrls.current = []
    },
    [],
  )

  const remaining = MAX_IMAGES - value.length
  const busy = pending.length > 0

  async function handleFiles(fileList: FileList | null) {
    setError('')
    if (!fileList || fileList.length === 0) return

    const selected = Array.from(fileList)
    const problems = selected.map(validateImageFile).filter((message): message is string => Boolean(message))
    const accepted = selected.filter((file) => validateImageFile(file) === null)

    if (problems.length > 0) setError(problems.join(' '))
    if (accepted.length === 0) return

    if (accepted.length > remaining) {
      setError(`You can add ${remaining} more image${remaining === 1 ? '' : 's'} to this product (max ${MAX_IMAGES}).`)
      return
    }

    const queue: PendingUpload[] = accepted.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      previewUrls.current.push(previewUrl)
      return { id: crypto.randomUUID(), name: file.name, previewUrl, progress: 0 }
    })
    setPending(queue)

    const uploaded: ProductImage[] = []
    for (const [index, file] of accepted.entries()) {
      const entry = queue[index]
      try {
        uploaded.push(
          await uploadProductImage(file, {
            onProgress: (loaded, total) =>
              setPending((current) =>
                current.map((item) =>
                  item.id === entry.id ? { ...item, progress: total > 0 ? Math.round((loaded / total) * 100) : 0 } : item,
                ),
              ),
          }),
        )
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : `${file.name} could not be uploaded.`)
      } finally {
        URL.revokeObjectURL(entry.previewUrl)
        previewUrls.current = previewUrls.current.filter((url) => url !== entry.previewUrl)
        setPending((current) => current.filter((item) => item.id !== entry.id))
      }
    }

    // Single state update keeps the value prop in step with what actually landed.
    if (uploaded.length > 0) onChange([...value, ...uploaded])
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeImage(index: number) {
    const [removed] = value.slice(index, index + 1)
    onChange(value.filter((_, position) => position !== index))

    if (removed?.fileId) {
      startRemoval(async () => {
        const result = await deleteUploadedImage(removed.fileId as string)
        if (!result.ok) setError(result.error ?? 'The image was detached but could not be deleted from the CDN.')
      })
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id="product-images"
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          className="sr-only"
          disabled={disabled || busy || remaining === 0}
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <label
          htmlFor="product-images"
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            disabled || busy || remaining === 0
              ? 'cursor-not-allowed border-black/10 text-black/60'
              : 'cursor-pointer border-[#00c853] text-black hover:bg-black/[0.03]'
          }`}
        >
          {busy ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ImagePlus aria-hidden="true" className="size-4" />
          )}
          {busy ? 'Uploading…' : 'Add images'}
        </label>
        <p className="text-xs font-normal text-black/55">
          {value.length} of {MAX_IMAGES} used · {IMAGE_RULES_TEXT}
        </p>
      </div>

      <div aria-live="polite" className="text-xs font-normal">
        {error && (
          <p role="alert" className="rounded-lg border border-[#c62828]/30 bg-[#c62828]/[0.04] p-2 text-[#c62828]">
            {error}
          </p>
        )}
        {isRemoving && <p className="text-black/60">Removing image…</p>}
      </div>

      {(value.length > 0 || pending.length > 0) && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {value.map((image, index) => (
            <li
              key={image.url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-black/5"
            >
              <Image
                src={productImageUrl(image.url, 400)}
                alt={image.name}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                quality={70}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                aria-label={`Remove ${image.name}`}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-black opacity-0 transition-opacity hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853] disabled:cursor-not-allowed disabled:opacity-40 group-hover:opacity-100"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
            </li>
          ))}

          {pending.map((item) => (
            <li
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-[#00c853]/50 bg-black/5"
            >
              {/* Instant local preview — the CDN copy does not exist yet. */}
              <Image src={item.previewUrl} alt="" fill unoptimized sizes="16vw" className="object-cover opacity-60" />
              <div className="absolute inset-x-0 bottom-0 bg-white/90 px-2 py-1">
                <p className="truncate text-[10px] font-medium text-black" title={item.name}>
                  {item.progress}%
                </p>
                <div className="mt-0.5 h-0.5 w-full overflow-hidden rounded bg-black/10">
                  <div className="h-full bg-[#00c853] transition-[width]" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}