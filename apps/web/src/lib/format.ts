// Transforme "2026-11-10T09:00:00Z" en "10 novembre 2026"
export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}