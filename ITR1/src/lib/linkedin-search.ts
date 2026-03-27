const API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY as string
const CX = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID as string

export interface LinkedInResult {
  name: string
  title: string
  snippet: string
  url: string
  displayUrl: string
}

function parseNameFromTitle(title: string): string {
  const withoutLinkedIn = title.replace(/\s*[\|–-]\s*LinkedIn.*$/i, "").trim()
  const beforeDash = withoutLinkedIn.split(/\s*[-–]\s*/)[0].trim()
  return beforeDash
}

function parseTitleFromSnippet(snippet: string, fullTitle: string): string {
  const titleMatch = fullTitle.match(/^[^–\-|]+[-–]\s*(.+?)\s*[\|]/)
  if (titleMatch) return titleMatch[1].trim()
    
  return snippet.split("\n")[0].trim()
}

export async function searchLinkedIn(query: string): Promise<LinkedInResult[]> {
  if (!API_KEY || !CX) {
    throw new Error("VITE_GOOGLE_SEARCH_API_KEY or VITE_GOOGLE_SEARCH_ENGINE_ID is not set in your .env file")
  }

  const params = new URLSearchParams({
    key: API_KEY,
    cx: CX,
    q: `${query} site:linkedin.com/in`,
    num: "8",
  })

  const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? "Search failed")
  }

  const data = await res.json()

  if (!data.items || data.items.length === 0) return []

  return data.items
    .filter((item: Record<string, string>) => item.link.includes("linkedin.com/in/"))
    .map((item: Record<string, string>) => ({
      name: parseNameFromTitle(item.title),
      title: parseTitleFromSnippet(item.snippet ?? "", item.title),
      snippet: item.snippet ?? "",
      url: item.link,
      displayUrl: item.displayLink,
    }))
}