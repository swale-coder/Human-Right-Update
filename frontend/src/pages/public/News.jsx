const SAMPLE_NEWS = [
  { title: 'HRPC Launches Legal Aid Helpline', date: '2026-05-12', summary: 'A new toll-free helpline connects victims of rights violations with legal counsel.' },
  { title: 'Annual Human Rights Day Event', date: '2025-12-10', summary: 'Over 500 volunteers and members gathered to mark Human Rights Day with workshops and awards.' },
  { title: 'Partnership with State Legal Services Authority', date: '2025-09-03', summary: 'HRPC signs an MoU to expand free legal aid camps across the state.' },
]

export default function News() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ color: 'var(--green-deep)' }}>News & Updates</h1>
      {SAMPLE_NEWS.map((n) => (
        <div key={n.title} className="profile-card" style={{ marginBottom: 16 }}>
          <h3>{n.title}</h3>
          <p style={{ color: 'var(--gold)', fontSize: 13 }}>{new Date(n.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>{n.summary}</p>
        </div>
      ))}
    </div>
  )
}
