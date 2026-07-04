export function displayOwnerName(name: string): string {
  // Flags obviously non-human seed/system strings so they never
  // reach a doctor calling a real client.
  const looksLikeSystemId = /^[a-z0-9_]+$/i.test(name) && name.includes('_')
  return looksLikeSystemId ? name.replace(/_/g, ' ') : name
}
