export function displayOwnerName(name: string): string {
  // Flags obviously non-human seed/system strings so they never
  // reach a doctor calling a real client.
  const looksLikeSystemId = /^[a-z0-9_]+$/i.test(name) && name.includes('_')
  return looksLikeSystemId ? name.replace(/_/g, ' ') : name
}
export function formatCurrency(amount: number, locale: string = "en-EG"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2
  }).format(amount);
}
