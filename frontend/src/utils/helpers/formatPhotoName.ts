const PHOTO_EXTENSION_RE = /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp|tiff?)$/i

export function formatPhotoName(name: string) {
  return name.replace(PHOTO_EXTENSION_RE, '')
}
