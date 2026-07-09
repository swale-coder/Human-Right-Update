import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { volunteerService } from '../../../services/volunteerService'
import { downloadBlob } from '../../../utils/downloadBlob'

export default function MyVolunteering() {
  const [volunteer, setVolunteer] = useState(undefined)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    volunteerService
      .getMine()
      .then((data) => setVolunteer(data.volunteer))
      .catch(() => setVolunteer(null))
  }, [])

  if (volunteer === undefined) return <div className="page-loader">Loading...</div>

  if (!volunteer) {
    return (
      <div>
        <h2 className="page-title">My Volunteering</h2>
        <div className="info-banner">
          You haven't applied to volunteer yet. Visit <a href="/volunteer-register">the volunteer registration page</a> to apply.
        </div>
      </div>
    )
  }

  const handleDownload = async () => {
    setBusy(true)
    try {
      const blob = await volunteerService.downloadCertificate(volunteer.id)
      downloadBlob(blob, `volunteer-certificate-${volunteer.id}.pdf`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not download certificate')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h2 className="page-title">My Volunteering</h2>
      <div className="profile-card" style={{ maxWidth: 560 }}>
        <div className="profile-row"><span>Status</span><strong>{volunteer.status}</strong></div>
        <div className="profile-row"><span>Skills</span><strong>{volunteer.skills || '—'}</strong></div>
        {volunteer.joinedAt && <div className="profile-row"><span>Joined</span><strong>{new Date(volunteer.joinedAt).toLocaleDateString('en-IN')}</strong></div>}
      </div>

      {volunteer.status === 'APPROVED' && (
        <button className="btn btn-primary" disabled={busy} onClick={handleDownload}>Download Certificate</button>
      )}

      <h3 className="page-subtitle" style={{ marginTop: 24 }}>My Tasks</h3>
      {(volunteer.tasks || []).length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <ul className="timeline" style={{ maxWidth: 560 }}>
          {volunteer.tasks.map((t) => (
            <li key={t.id}>
              <strong>{t.title}</strong> — {t.status}
              {t.description && <div className="timeline-detail">{t.description}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
