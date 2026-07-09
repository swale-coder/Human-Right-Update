const PILLARS = [
  {
    num: 'सेवा / SERVICE',
    title: 'Stand with those who have nowhere else to turn',
    body: 'We take up complaints from individuals and communities whose rights have been denied, ignored, or overridden — without charge, and without requiring influence to be heard.',
  },
  {
    num: 'सुरक्षा / PROTECTION',
    title: 'Push institutions toward accountability',
    body: 'We document violations, escalate them through proper legal and administrative channels, and follow cases until they reach a resolution — not just a file number.',
  },
  {
    num: 'संगठन / ORGANISATION',
    title: 'Build a network that outlasts any one case',
    body: 'Through volunteers, interns, and partner advocates across Gujarat, we keep watch in places that would otherwise go unmonitored.',
  },
]

export default function Mandate() {
  return (
    <section className="mandate-bg" id="mandate">
      <div className="wrap">
        <div className="section-head">
          <div className="tag">Our Charter</div>
          <div>
            <h2>Three commitments, one mandate.</h2>
            <p className="sub">
              The Council's emblem carries them as a motto — sewa, suraksha, sangathan —
              and they shape every case we take on.
            </p>
          </div>
        </div>
        <div className="pillars">
          {PILLARS.map((p) => (
            <div className="pillar" key={p.num}>
              <span className="num">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
