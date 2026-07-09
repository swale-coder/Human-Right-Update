import { useState } from 'react'
import logo from './logo.jpg'

export default function Certificate() {
  const [name, setName] = useState('')
  const [reason, setReason] = useState('outstanding contribution towards the protection and promotion of human rights')
  const [place, setPlace] = useState('Ahmedabad')
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-GB'))
  const [signatory, setSignatory] = useState('President')

  return (
    <section id="certificate" className="doc-section">
      <h2>Certificate of Appreciation</h2>
      <div className="doc-form sans">
        <label>Recipient Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /></label>
        <label>Reason / Contribution<textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} /></label>
        <label>Place<input value={place} onChange={e => setPlace(e.target.value)} /></label>
        <label>Date<input value={date} onChange={e => setDate(e.target.value)} /></label>
        <label>Signatory Title<input value={signatory} onChange={e => setSignatory(e.target.value)} /></label>
        <button onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="doc-preview certificate-preview">
        <img className="doc-logo" src={logo} alt="seal" />
        <div className="doc-org-hi">मानव अधिकार सुरक्षा संघ</div>
        <div className="doc-org-en">Human Right Protection Council of Gujarat</div>
        <h3 className="doc-title">Certificate of Appreciation</h3>
        <p className="doc-body">This certificate is proudly presented to</p>
        <p className="doc-name">{name || '[ Recipient Name ]'}</p>
        <p className="doc-body">in recognition of {reason}.</p>
        <div className="doc-footer-row">
          <div>Place: {place}</div>
          <div>Date: {date}</div>
        </div>
        <div className="doc-sign">_____________________<br />{signatory}</div>
      </div>
    </section>
  )
}
