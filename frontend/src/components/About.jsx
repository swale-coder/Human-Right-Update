const CREDENTIALS = [
  { k: 'Established', v: '2001, Ahmedabad, Gujarat' },
  { k: 'BPT Registration', v: 'Act 1950, No. F/8154 (Ahmedabad)' },
  { k: 'Societies Registration', v: 'S.R. Act 1860, Sec. 21, No. 8308, Govt. of India' },
  { k: 'Income Tax Recognition', v: 'U/S 12AA, w.e.f. 02-08-2001, No. DIT(E)/12AA/723/01-02' },
]

export default function About() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="section-head">
          <div className="tag">About the Council</div>
          <div>
            <h2>A registered, accountable organisation.</h2>
            <p className="sub">
              Every claim below is verifiable against our registration documents —
              available to partners, donors, and government bodies on request.
            </p>
          </div>
        </div>
        <div className="credentials">
          {CREDENTIALS.map((c) => (
            <div key={c.k}>
              <div className="k">{c.k}</div>
              <div className="v">{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
