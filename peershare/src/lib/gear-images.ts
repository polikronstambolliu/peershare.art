/** Gear row may have image_urls (array) or legacy image_url (single string). */
export function getGearImageUrls(item: {
  image_url?: string | null
  image_urls?: string[] | null
}): string[] {
  if (Array.isArray(item.image_urls) && item.image_urls.length > 0) {
    return item.image_urls.filter((url): url is string => Boolean(url))
  }
  if (item.image_url) return [item.image_url]
  return []
}

export function getPrimaryGearImageUrl(item: {
  image_url?: string | null
  image_urls?: string[] | null
}): string | null {
  return getGearImageUrls(item)[0] ?? null
}
