p='ITR1/src/components/contacts/contacts-page.tsx'
s=open(p,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(a,s.count(a))
    s=s.replace(a,b)
rep('import { cn } from "@/lib/utils"\n','import { cn } from "@/lib/utils"\nimport { safeExternalUrl } from "@/lib/safe-url"\n')
rep('''  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
''','''  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [logError, setLogError] = useState<string | null>(null)
''')
rep('''  const [editData, setEditData] = useState<any>(null)
  const [editSuccess, setEditSuccess] = useState(false)
''','''  const [editData, setEditData] = useState<any>(null)
''')
rep('''    if (!selectedContact || !formSummary.trim()) return
    await addInteraction(selectedContact.sponsorId, {
      id: crypto.randomUUID(),
      type: formType,
      date: new Date().toISOString().split("T")[0],
      summary: formSummary.trim(),
      contactId: selectedContact.id
    })
    setLogOpen(false)
''','''    if (!selectedContact || !formSummary.trim()) return
    setLogError(null)
    try {
      await addInteraction(selectedContact.sponsorId, {
        id: crypto.randomUUID(),
        type: formType,
        date: new Date().toISOString().split("T")[0],
        summary: formSummary.trim(),
        contactId: selectedContact.id
      })
      setLogOpen(false)
    } catch (err: any) {
      setLogError(err?.message || "Failed to save interaction. Check permissions or network.")
    }
''')
rep('''      setError("Please enter a valid email address.")
      return
    }

    const contactPayload = {''','''      setError("Please enter a valid email address.")
      return
    }

    const linkedInRaw = newContact.linkedIn.trim()
    const linkedIn = linkedInRaw ? safeExternalUrl(linkedInRaw) : ""
    if (linkedIn === null) {
      setError("Please enter a valid http(s) LinkedIn URL.")
      return
    }

    const contactPayload = {''')
rep('''      linkedIn: newContact.linkedIn,
      tags:''','''      linkedIn,
      tags:''')
rep('''    try {
      const existingSponsor''','''    setSaving(true)
    try {
      const existingSponsor''')
rep('''      setSuccess(true)
      setTimeout(() => {
        setAddOpen(false)
        setTimeout(() => {
          setSuccess(false)
          setNewContact({ name: "", email: "", organization: "", title: "", linkedIn: "", tags: "" })
        }, 400)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to save contact to database. Check permissions or network.")
    }''','''      // Only reached when the insert/update promise resolved without error.
      setAddOpen(false)
      setNewContact({ name: "", email: "", organization: "", title: "", linkedIn: "", tags: "" })
    } catch (err: any) {
      setError(err?.message || "Failed to save contact to database. Check permissions or network.")
    } finally {
      setSaving(false)
    }''')
rep('''    setSelectedContact(contact)
    setFormType("email")''','''    setSelectedContact(contact)
    setLogError(null)
    setFormType("email")''')
rep('''  const handleEditOpen = (contact: any) => {
    setEditData({''','''  const handleEditOpen = (contact: any) => {
    setError(null)
    setEditData({''')
rep('''    const updatedContact = {
      ...editData,
      tags: editData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    }

    try {
      await updateContact(editData.sponsorId, updatedContact)

      setEditSuccess(true)
      setTimeout(() => {
        setEditOpen(false)
        setTimeout(() => {
          setEditSuccess(false)
          if (viewContact?.id === updatedContact.id) {
            setViewContact(updatedContact)
          }
        }, 400)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to update contact. Check permissions or network.")
    }''','''    const linkedInRaw = (editData.linkedIn || "").trim()
    const linkedIn = linkedInRaw ? safeExternalUrl(linkedInRaw) : ""
    if (linkedIn === null) {
      setError("Please enter a valid http(s) LinkedIn URL.")
      return
    }

    // Strip view-only fields that were merged in from the parent sponsor
    const { sponsorId, company: _company, tier: _tier, ...contactFields } = editData
    const updatedContact = {
      ...contactFields,
      linkedIn,
      tags: editData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    }

    setSaving(true)
    try {
      await updateContact(sponsorId, updatedContact)
      // Only reached when the update resolved without error.
      setEditOpen(false)
      if (viewContact?.id === updatedContact.id) {
        setViewContact({ ...viewContact, ...updatedContact })
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update contact. Check permissions or network.")
    } finally {
      setSaving(false)
    }''')
rep('''                    {contact.linkedIn && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Linkedin className="h-3.5 w-3.5" />
                        <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Profile</a>
                      </div>
                    )}''','''                    {safeExternalUrl(contact.linkedIn) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Linkedin className="h-3.5 w-3.5" />
                        <a
                          href={safeExternalUrl(contact.linkedIn) ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary transition-colors"
                        >
                          Profile
                        </a>
                      </div>
                    )}''')
rep('''                        <a href={`mailto:${contact.email}`} className''','''                        <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()} className''')
rep('''                        {viewContact.linkedIn ? (
                          <a
                            href={viewContact.linkedIn}''','''                        {safeExternalUrl(viewContact.linkedIn) ? (
                          <a
                            href={safeExternalUrl(viewContact.linkedIn) ?? undefined}''')
rep('''{viewContact.linkedIn.replace("https://", "")}''','''{String(viewContact.linkedIn).replace(/^https?:\\/\\//, "")}''')
rep('''                onChange={(e) => setFormSummary(e.target.value)}
              />
            </div>
          </div>''','''                onChange={(e) => setFormSummary(e.target.value)}
              />
            </div>
            {logError && (
              <div role="alert" className="text-xs text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">
                {logError}
              </div>
            )}
          </div>''')
rep('''          {editSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <CheckCircle2 className="h-16 w-16 text-emerald-400" />
              <p className="text-xl font-bold">Changes Saved!</p>
            </div>
          ) : (
            <div className="grid gap-4 py-4">''','''          {(
            <div className="grid gap-4 py-4">''')
rep('''          {!editSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          )}''','''          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>''')
rep('''          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-emerald-400" />
              <div className="text-center">
                <p className="text-xl font-bold">Success!</p>
                <p className="text-sm text-muted-foreground">New contact has been added to the directory.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">''','''          {(
            <div className="grid gap-4 py-4">''')
rep('''          {!success && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddContact}>Save Contact</Button>
            </DialogFooter>
          )}''','''          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddContact} disabled={saving}>{saving ? "Saving..." : "Save Contact"}</Button>
          </DialogFooter>''')
open(p,'w',encoding='utf-8').write(s)
print("ok")
