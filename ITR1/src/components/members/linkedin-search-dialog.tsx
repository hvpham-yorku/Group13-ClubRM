import { useState, useRef } from "react"
import { searchLinkedIn, type LinkedInResult } from "@/lib/linkedin-search"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, Loader2, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkedInSearchDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (result: LinkedInResult) => void
}

export function LinkedInSearchDialog({ open, onClose, onSelect }: LinkedInSearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LinkedInResult[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setStatus("loading")
    setError(null)
    setResults([])
    try {
      const res = await searchLinkedIn(query.trim())
      setResults(res)
      setStatus("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
      setStatus("error")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch()
  }

  function handleSelect(result: LinkedInResult) {
    onSelect(result)
    onClose()
    setQuery("")
    setResults([])
    setStatus("idle")
  }

  function handleClose() {
    onClose()
    setQuery("")
    setResults([])
    setStatus("idle")
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            Find LinkedIn Profile
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search by name, school, role..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
              autoFocus
            />
          </div>
          <Button onClick={handleSearch} disabled={status === "loading" || !query.trim()}>
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground -mt-1">
          Tip: add your school name to narrow results e.g. "John Smith York University"
        </p>

        {/* Error */}
        {status === "error" && error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        {/* Loading skeleton */}
        {status === "loading" && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* No results */}
        {status === "done" && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Linkedin className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No LinkedIn profiles found.</p>
            <p className="text-xs mt-1">Try adding a school name or company to your search.</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {results.map((result, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start justify-between gap-3 p-3 rounded-lg border border-border/50",
                  "hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                )}
                onClick={() => handleSelect(result)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* LinkedIn avatar placeholder */}
                  <div className="h-10 w-10 rounded-full bg-[#0A66C2]/10 border border-[#0A66C2]/20 flex items-center justify-center shrink-0">
                    <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{result.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.title}</p>
                    <p className="text-[10px] text-[#0A66C2] truncate mt-0.5">{result.displayUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(result.url, "_blank", "noopener noreferrer")
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(result)
                    }}
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}