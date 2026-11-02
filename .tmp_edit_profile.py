p='ITR1/src/components/profile/profile-page.tsx'
s=open(p,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(a,s.count(a))
    s=s.replace(a,b)
rep('''import { cn, getInitials } from "@/lib/utils"
''','''import { cn, getInitials } from "@/lib/utils"
import { safeExternalUrl } from "@/lib/safe-url"
import { useToast } from "@/context/toast-context"
''')
rep('''function buildSocialUrl(key: keyof SocialLinks, value: string): string {
  if (!value) return ""
  if (value.startsWith("http")) return value
  const bases: Record<keyof SocialLinks, string> = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/in/",
    twitter: "https://x.com/",
    tiktok: "https://tiktok.com/@",
  }
  return bases[key] + value.replace(/^@/, "")
}''','''const SOCIAL_BASES: Record<keyof SocialLinks, string> = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  linkedin: "https://linkedin.com/in/",
  twitter: "https://x.com/",
  tiktok: "https://tiktok.com/@",
}

const SOCIAL_HOSTS: Record<keyof SocialLinks, readonly string[]> = {
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com"],
  linkedin: ["linkedin.com"],
  twitter: ["x.com", "twitter.com"],
  tiktok: ["tiktok.com"],
}

/**
 * Build a safe https URL for a social handle or full profile URL.
 * Returns null for anything that isn't an http(s) URL on the expected network
 * (e.g. `javascript:` payloads), so it is never rendered into an href.
 */
function buildSocialUrl(key: keyof SocialLinks, value: string): string | null {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return null
  // Full URL (or something with a scheme / domain) -> validate against the network's hosts
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) || trimmed.startsWith("//") || /^(www\\.)?[^/\\s]+\\.[a-z]{2,}\\//i.test(trimmed)) {
    return safeExternalUrl(trimmed, { allowedHosts: SOCIAL_HOSTS[key] })
  }
  // Plain username
  const handle = trimmed.replace(/^@/, "")
  return safeExternalUrl(SOCIAL_BASES[key] + encodeURIComponent(handle), { allowedHosts: SOCIAL_HOSTS[key] })
}''')
rep('''  const { user } = useAuth()
  const [profileId''','''  const { user } = useAuth()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [profileId''')
rep('''    if (profileId) {
      await supabase.from("socials").update(payload).eq("id", profileId)
    } else {
      const { data } = await supabase.from("socials").insert(payload).select().single()
      if (data) setProfileId(data.id)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [user, profile, profileId])''','''    setSaving(true)
    try {
      if (profileId) {
        const { error } = await supabase.from("socials").update(payload).eq("id", profileId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from("socials").insert(payload).select().single()
        if (error) throw error
        if (data) setProfileId(data.id)
      }
    } catch (err: any) {
      setSaved(false)
      showToast({
        type: "error",
        title: "Could not save profile",
        message: err?.message ?? "Please check your connection and try again.",
      })
      return
    } finally {
      setSaving(false)
    }

    showToast({ type: "success", title: "Profile saved" })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [user, profile, profileId, showToast])''')
rep('''            {Object.entries(profile.socials).map(([key, value]) => {
              if (!value) return null
              const field = SOCIAL_FIELDS.find((f) => f.key === key)
              if (!field) return null
              return (
                <a key={key} href={buildSocialUrl(key as keyof SocialLinks, value)} target''','''            {Object.entries(profile.socials).map(([key, value]) => {
              if (!value) return null
              const field = SOCIAL_FIELDS.find((f) => f.key === key)
              if (!field) return null
              const href = buildSocialUrl(key as keyof SocialLinks, value)
              if (!href) return null
              return (
                <a key={key} href={href} target''')
rep('''                {profile.socials[field.key] && (
                  <a
                    href={buildSocialUrl(field.key, profile.socials[field.key])}''','''                {buildSocialUrl(field.key, profile.socials[field.key]) && (
                  <a
                    href={buildSocialUrl(field.key, profile.socials[field.key]) ?? undefined}''')
rep('''        <Button onClick={handleSave} className="gap-2 min-w-[140px]">''','''        <Button onClick={handleSave} disabled={saving || loading} className="gap-2 min-w-[140px]">''')
rep('''          {saved ? "Saved!" : "Save Profile"}''','''          {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}''')
open(p,'w',encoding='utf-8').write(s)
print("ok")
