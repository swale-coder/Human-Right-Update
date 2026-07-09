import { useState } from 'react'

export default function Involve() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'Internship', msg: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // This is a demonstration form for the MVP — wire this up to a real
    // endpoint (e.g. an email service or backend API) before going live.
    console.log('Involve form submission:', form)
    setSubmitted(true)
  }

  return (
    <section id="involve">
      <div className="wrap involve">
        <div>
          <div className="tag">Get Involved</div>
          <h2>Apply for an internship or volunteer role.</h2>
          <p>
            Students of law, social work, and journalism regularly intern with the Council
            on live casework. Tell us a little about yourself and a coordinator will respond
            by phone or email.
          </p>
          <p style={{ marginTop: 20, fontSize: 13, color: '#8A8175' }}>
            This is a demonstration form for the MVP — submissions are not yet connected to a live inbox.
          </p>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <input id="name" type="text" placeholder="Your name" required value={form.name} onChange={handleChange} />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" required value={form.email} onChange={handleChange} />

          <label htmlFor="role">I'm interested in</label>
          <select id="role" value={form.role} onChange={handleChange}>
            <option>Internship</option>
            <option>Volunteering</option>
            <option>Filing a complaint</option>
            <option>Partnership / Donation</option>
          </select>

          <label htmlFor="msg">Message</label>
          <textarea id="msg" rows="3" placeholder="A few lines about your background or your concern" value={form.msg} onChange={handleChange} />

          <button type="submit" disabled={submitted}>
            {submitted ? 'Request received' : 'Submit request'}
          </button>
          <div className="form-note">By submitting, you agree to be contacted by the Council regarding your request.</div>
        </form>
      </div>
    </section>
  )
}
