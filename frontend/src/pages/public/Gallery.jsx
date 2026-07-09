export default function Gallery() {
  const placeholderImages = Array.from({ length: 6 }, (_, i) => i + 1)
  return (
    <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ color: 'var(--green-deep)' }}>Gallery</h1>
      <p>Moments from our outreach programs, events, and community work.</p>
      <div className="card-grid">
        {placeholderImages.map((i) => (
          <div key={i} className="dashboard-card" style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
            <span style={{ color: 'var(--gold)' }}>Photo {i}</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 16, color: 'var(--gold)' }}>
        Photos from your events will appear here once uploaded by an administrator.
      </p>
    </div>
  )
}
