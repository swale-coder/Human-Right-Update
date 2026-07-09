const SERVICES = [
  {
    num: '01',
    title: 'Complaint Intake & Documentation',
    body: 'Recording first-hand accounts of rights violations and building the documentation needed for formal escalation.',
  },
  {
    num: '02',
    title: 'Legal & Administrative Follow-up',
    body: 'Liaising with police, civic bodies, and tribunals to move stalled cases forward on behalf of complainants.',
  },
  {
    num: '03',
    title: 'Community Awareness',
    body: 'Running outreach sessions so that people know what protections the law already gives them.',
  },
  {
    num: '04',
    title: 'Student & Research Internships',
    body: 'Hosting law and social-work students for structured internships in human rights casework and field study.',
  },
]

export default function Services() {
  return (
    <section id="services">
      <div className="wrap">
        <div className="section-head">
          <div className="tag">What We Do</div>
          <div>
            <h2>Where the Council gets involved.</h2>
            <p className="sub">
              Four areas of work, drawn directly from the complaints and requests we receive most often.
            </p>
          </div>
        </div>
        <div className="services">
          {SERVICES.map((s) => (
            <div className="service" key={s.num}>
              <span className="mark">{s.num}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
