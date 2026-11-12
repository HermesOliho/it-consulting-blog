// Vrai UNIQUEMENT en développement (npm run dev) ET si .env.local
// contient VITE_USE_MOCK=true. En production, c'est toujours faux.
export const USE_MOCK: boolean =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'