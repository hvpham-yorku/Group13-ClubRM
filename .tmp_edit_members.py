import re
base='ITR1/src/components/members/'
def edit(fn, pairs):
    p=base+fn
    s=open(p,encoding='utf-8').read()
    for a,b in pairs:
        assert s.count(a)==1,(fn,a,s.count(a))
        s=s.replace(a,b)
    open(p,'w',encoding='utf-8').write(s)

# ---- add-member-dialog
edit('add-member-dialog.tsx',[
('''  const [formRole, setFormRole] = useState<Role>("Executive")
''','''  const [formRole, setFormRole] = useState<Role>("Executive")
  const [formStatus, setFormStatus] = useState<Member["status"]>("active")
'''),
('''    const raw = value.trim()
    const stripped = stripToUsername(raw)
''','''    // Strip characters that have meaning in PostgREST filter syntax (",", "(", ")")
    // and LIKE wildcards so user input can't alter the `.or()` filter.
    const raw = value.trim().replace(/[,()%*\\\\]/g, " ").trim()
    const stripped = stripToUsername(raw)
    if (!raw) {
      setUserSearchResults([])
      setUserSearchStatus("idle")
      return
    }
'''),
('''      role: formRole,
      status: "active",''','''      role: formRole,
      status: formStatus,'''),
('''    setFormRole("Executive")
''','''    setFormRole("Executive")
    setFormStatus("active")
'''),
('''              <Select defaultValue="active">''','''              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as Member["status"])}>'''),
])

# ---- member-card
for fn in ['member-card.tsx','member-row.tsx']:
    p=base+fn
    s=open(p,encoding='utf-8').read()
    s=s.replace('''  onEdit: (member: Member) => void
  onDelete: (id: string) => void''','''  /** Omit to hide the Edit action (e.g. user lacks members.write). */
  onEdit?: (member: Member) => void
  /** Omit to hide the Remove action (e.g. user lacks members.remove). */
  onDelete?: (id: string) => void''')
    if fn=='member-card.tsx':
        a='''            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(member) }}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(member.id) }}>
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </DropdownMenuItem>'''
        b='''            {onEdit && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(member) }}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(member.id) }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </DropdownMenuItem>
              </>
            )}'''
    else:
        a='''            <DropdownMenuItem onClick={() => onEdit(member)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(member.id)}>
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </DropdownMenuItem>'''
        b='''            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(member)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(member.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </DropdownMenuItem>
              </>
            )}'''
    assert s.count(a)==1,fn
    s=s.replace(a,b)
    open(p,'w',encoding='utf-8').write(s)

# ---- toolbar
edit('members-toolbar.tsx',[
('import { Search, LayoutGrid, List } from "lucide-react"','import { Search, LayoutGrid, List, Download } from "lucide-react"'),
('''  roles: string[]
}''','''  roles: string[]
  /** When provided, an "Export CSV" button is shown. */
  onExportCsv?: () => void
  exportDisabled?: boolean
}'''),
('''  roles,
}: MembersToolbarProps) {''','''  roles,
  onExportCsv,
  exportDisabled,
}: MembersToolbarProps) {'''),
('''      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">''','''      <div className="flex items-center gap-2">
      {onExportCsv && (
        <Button variant="outline" size="sm" onClick={onExportCsv} disabled={exportDisabled} className="h-9 gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      )}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">'''),
('''          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>''','''          <List className="h-4 w-4" />
        </Button>
      </div>
      </div>
    </div>'''),
])

# ---- members page
edit('members-page.tsx',[
('''import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
''','''import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRole } from "@/context/role-context"
import { hasPermission } from "@/lib/permissions"
import { objectsToCsv, downloadCsv } from "@/lib/csv"
'''),
('''  const { members, addMember, updateMember, deleteMember, stats } = useMembers()
''','''  const { members, addMember, updateMember, deleteMember, stats } = useMembers()
  const { role } = useRole()
  // UI gating only — RLS on `members` is the real enforcement.
  const canWrite = hasPermission(role, "members.write")
  const canRemove = hasPermission(role, "members.remove")
'''),
('''  function handleAdd(member: Member) {
    addMember(member)
  }

  function handleEdit(member: Member) {
    updateMember(member)
    setEditMember(null)
  }
''','''  function handleAdd(member: Member) {
    if (!canWrite) return
    addMember(member)
  }

  function handleEdit(member: Member) {
    if (!canWrite) return
    updateMember(member)
    setEditMember(null)
  }

  function handleDelete(id: string) {
    if (!canRemove) return
    const target = members.find((m) => m.id === id)
    if (!window.confirm(`Remove ${target?.name ?? "this member"} from the roster?`)) return
    deleteMember(id)
  }

  function handleExportCsv() {
    const csv = objectsToCsv(filtered, [
      { header: "Name", value: (m) => m.name },
      { header: "Email", value: (m) => m.email },
      { header: "Phone", value: (m) => m.phone },
      { header: "Role", value: (m) => m.role },
      { header: "Status", value: (m) => m.status },
      { header: "Department", value: (m) => m.department },
      { header: "Year", value: (m) => m.year },
      { header: "Join Date", value: (m) => m.joinDate },
      { header: "Tasks Completed", value: (m) => m.tasksCompleted },
      { header: "Events Attended", value: (m) => m.eventsAttended },
    ])
    downloadCsv(`members-${new Date().toISOString().split("T")[0]}.csv`, csv)
  }
'''),
('''        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>''','''        {canWrite && (
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        )}'''),
('''        roles={ALL_ROLES as string[]}
      />''','''        roles={ALL_ROLES as string[]}
        onExportCsv={handleExportCsv}
        exportDisabled={filtered.length === 0}
      />'''),
])
p=base+'members-page.tsx'
s=open(p,encoding='utf-8').read()
assert s.count('''              onEdit={setEditMember}
              onDelete={deleteMember}''')==1
s=s.replace('''              onEdit={setEditMember}
              onDelete={deleteMember}''','''              onEdit={canWrite ? setEditMember : undefined}
              onDelete={canRemove ? handleDelete : undefined}''')
s=s.replace('''                  onEdit={setEditMember}
                  onDelete={deleteMember}''','''                  onEdit={canWrite ? setEditMember : undefined}
                  onDelete={canRemove ? handleDelete : undefined}''')
assert 'onDelete={deleteMember}' not in s
s=s.replace('''      <AddMemberDialog
        open={addOpen}''','''      <AddMemberDialog
        open={addOpen && canWrite}''')
s=s.replace('''        open={!!editMember}''','''        open={!!editMember && canWrite}''')
open(p,'w',encoding='utf-8').write(s)
print('ok')
