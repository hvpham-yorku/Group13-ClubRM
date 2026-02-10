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

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.name}>
              <td>{m.name}</td>
              <td>{m.role}</td>
              <td>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
