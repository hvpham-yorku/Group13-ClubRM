const members = [
  { name: "John Doe", role: "President", status: "Active" },
  { name: "Sarah Smith", role: "VP Finance", status: "Active" },
];

export default function MembersPage() {
  return (
    <div>
      <h1>TechClub</h1>
      <p>
        TechClub is a student-led organization focused on collaboration,
        technical growth, and student engagement.
      </p>

      <h2>Members</h2>

      <div className="rounded-xl border border-border bg-background overflow-hidden mt-4">
        <table className="w-full table-fixed text-left">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-4 w-1/3">Name</th>
              <th className="p-4 w-1/3">Role</th>
              <th className="p-4 w-1/3">Status</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m) => (
              <tr
                key={m.name}
                className="border-t hover:bg-muted/30 transition"
              >
                <td className="p-4 font-medium">{m.name}</td>
                <td className="p-4">{m.role}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
