import logo from '../logo.jpg'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div>
          <div className="eyebrow">Registered NGO &middot; Estd. 2001 &middot; Ahmedabad, Gujarat</div>
          <h1>
            Standing watch over the rights<br /> every citizen is <em>owed.</em>
          </h1>
          <p className="lead">
            For over two decades, the Human Right Protection Council of Gujarat has
            documented violations, supported the vulnerable, and pressed institutions
            toward accountability — sewa, suraksha, sangathan: service, protection,
            organisation.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#involve">Apply for Internship</a>
            <a className="btn btn-ghost" href="#contact">File a Complaint</a>
          </div>
        </div>
        <div className="seal-panel">
          <img src={logo} alt="Council seal" />
          <div className="estd">Estd. 2001</div>
          <div className="reg">
            Registered under BPT Act 1950, No. F/8154 (Ahmedabad)<br />
            Registered under Societies Reg. Act 1860, Section 21 — Govt. of India, No. 8308, Gujarat<br />
            Recognised U/S 12AA of the Income Tax Act, 1961 — w.e.f. 02-08-2001, No. DIT(E)/12AA/723/01-02
          </div>
        </div>
      </div>
    </section>
  )
}
