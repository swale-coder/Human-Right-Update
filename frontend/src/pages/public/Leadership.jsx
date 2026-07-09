const LEADERS = [
  { name: 'Chairperson', role: 'National Chairperson', bio: 'Leads the strategic direction and national advocacy efforts of HRPC.' },
  { name: 'Secretary General', role: 'Secretary General', bio: 'Oversees daily operations, programs, and inter-state coordination.' },
  { name: 'State Convener', role: 'State Convener — Gujarat', bio: 'Coordinates state-level membership, complaints, and outreach programs.' },
]

export default function Leadership() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ color: 'var(--green-deep)' }}>Leadership</h1>
      <div className="card-grid">
        {LEADERS.map((l) => (
          <div key={l.role} className="dashboard-card">
            <h3>{l.name}</h3>
            <p style={{ color: 'var(--gold)', fontWeight: 600 }}>{l.role}</p>
            <p>{l.bio}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
