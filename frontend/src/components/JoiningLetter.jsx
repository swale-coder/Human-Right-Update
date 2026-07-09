import { useState } from 'react'
import logo from './logo.jpg'

export default function JoiningLetter() {
  const [name, setName] = useState('')
  const [designation, setDesignation] = useState('District Coordinator')
  const [district, setDistrict] = useState('')
  const [refNo, setRefNo] = useState('HRPC/GJ/2026/____')
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-GB'))
  const [signatory, setSignatory] = useState('General Secretary')

  return (
    <section id="joining-letter" className="doc-section">
      <h2>Joining Letter</h2>
      <div className="doc-form sans">
        <label>Member Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /></label>
        <label>Designation<input value={designation} onChange={e => setDesignation(e.target.value)} /></label>
        <label>District / Unit<input value={district} onChange={e => setDistrict(e.target.value)} /></label>
        <label>Reference No.<input value={refNo} onChange={e => setRefNo(e.target.value)} /></label>
        <label>Date<input value={date} onChange={e => setDate(e.target.value)} /></label>
        <label>Signatory Title<input value={signatory} onChange={e => setSignatory(e.target.value)} /></label>
        <button onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="doc-preview letter-preview">
        <div className="letter-head">
          <img className="doc-logo" src={logo} alt="seal" />
          <div>
            <div className="doc-org-hi">मानव अधिकार सुरक्षा संघ</div>
            <div className="doc-org-en">Human Right Protection Council of Gujarat</div>
          </div>
        </div>
        <div className="letter-meta">
          <span>Ref: {refNo}</span>
          <span>Date: {date}</span>
        </div>
        <h3 className="doc-title">Joining Letter</h3>
        <p className="doc-body">
          This is to certify that <strong>{name || '[ Member Name ]'}</strong> has been duly appointed as
          <strong> {designation}</strong>{district ? <> for <strong>{district}</strong></> : null} of the Human Right
          Protection Council of Gujarat, with effect from the date of issue of this letter.
        </p>
        <p className="doc-body">
          The member is expected to uphold the constitution, code of conduct and objectives of the Council in
          letter and spirit, and to work towards the protection and promotion of human rights in their area of
          responsibility.
        </p>
        <p className="doc-body">We welcome them to the Council and wish them success.</p>
        <div className="doc-sign">_____________________<br />{signatory}</div>
      </div>
    </section>
  )
}
