import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { complaintService } from '../../../services/complaintService'

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [notes, setNotes] = useState({})

  useEffect(() => {
    complaintService
      .getMine()
      .then((data) => setComplaints(data.complaints))
      .catch(() => toast.error('Could not load complaints'))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!notes[id]) {
      try {
        const data = await complaintService.getNotes(id)
        setNotes((prev) => ({ ...prev, [id]: data.notes }))
      } catch {
        toast.error('Could not load case timeline')
      }
    }
  }

  if (loading) return <div className="page-loader">Loading...</div>

  return (
    <div>
      <h2 className="page-title">My Complaints</h2>
      <p className="page-subtitle">Track the status of complaints you've filed</p>

      {complaints.length === 0 ? (
        <div className="info-banner">You haven't filed any complaints yet.</div>
      ) : (
        complaints.map((c) => (
          <div key={c.id} className="profile-card" style={{ maxWidth: 640, marginBottom: 14 }}>
            <div className="profile-row">
              <span>Case Number</span>
              <strong>{c.complaintNumber}</strong>
            </div>
            <div className="profile-row">
              <span>Category</span>
              <strong>{c.category}</strong>
            </div>
            <div className="profile-row">
              <span>Status</span>
              <strong><span className={`status-pill status-${c.status.toLowerCase()}`}>{c.status.replace(/_/g, ' ')}</span></strong>
            </div>
            <div className="profile-row">
              <span>Priority</span>
              <strong>{c.priority}</strong>
            </div>
            <div className="profile-row">
              <span>Filed</span>
              <strong>{new Date(c.createdAt).toLocaleDateString('en-IN')}</strong>
            </div>
            {c.resolutionSummary && (
              <div className="profile-row">
                <span>Resolution</span>
                <strong>{c.resolutionSummary}</strong>
              </div>
            )}

            <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => toggleExpand(c.id)}>
              {expandedId === c.id ? 'Hide Timeline' : 'View Timeline'}
            </button>

            {expandedId === c.id && (
              <ul className="timeline" style={{ marginTop: 14 }}>
                {(notes[c.id] || []).map((n) => (
                  <li key={n.id}>
                    <span>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    <div className="timeline-detail">{n.note}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  )
}
