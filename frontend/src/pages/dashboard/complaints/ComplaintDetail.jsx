import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { complaintService } from '../../../services/complaintService'

const STATUS_OPTIONS = ['REGISTERED', 'UNDER_INVESTIGATION', 'RESOLVED', 'REJECTED', 'CLOSED']
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function ComplaintDetail() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [notes, setNotes] = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [resolutionText, setResolutionText] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [c, n, o] = await Promise.all([
        complaintService.getOne(id),
        complaintService.getNotes(id),
        complaintService.listOfficers().catch(() => ({ users: [] })),
      ])
      setComplaint(c.complaint)
      setNotes(n.notes)
      setOfficers(o.users || [])
    } catch {
      toast.error('Could not load complaint')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleUpdate = async (field, value) => {
    setBusy(true)
    try {
      const data = await complaintService.update(id, { [field]: value })
      setComplaint(data.complaint)
      toast.success('Updated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setBusy(true)
    try {
      await complaintService.addNote(id, newNote)
      setNewNote('')
      const n = await complaintService.getNotes(id)
      setNotes(n.notes)
      toast.success('Note added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add note')
    } finally {
      setBusy(false)
    }
  }

  const handleResolve = async () => {
    if (!resolutionText.trim()) {
      toast.error('Please enter a resolution summary')
      return
    }
    setBusy(true)
    try {
      const data = await complaintService.resolve(id, resolutionText)
      setComplaint(data.complaint)
      toast.success('Complaint marked resolved')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resolve')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="page-loader">Loading...</div>
  if (!complaint) return <div className="info-banner">Complaint not found.</div>

  return (
    <div>
      <Link to="/dashboard/complaints">&larr; Back to Complaints</Link>
      <h2 className="page-title" style={{ marginTop: 12 }}>{complaint.complaintNumber}</h2>
      <p className="page-subtitle">{complaint.category}</p>

      <div className="profile-card" style={{ maxWidth: 640 }}>
        <div className="profile-row"><span>Complainant</span><strong>{complaint.complainantName}</strong></div>
        <div className="profile-row"><span>Email</span><strong>{complaint.complainantEmail || '—'}</strong></div>
        <div className="profile-row"><span>Phone</span><strong>{complaint.complainantPhone || '—'}</strong></div>
        <div className="profile-row"><span>Description</span><strong style={{ textAlign: 'right', maxWidth: 360 }}>{complaint.description}</strong></div>
        <div className="profile-row"><span>Location</span><strong>{[complaint.city, complaint.taluka, complaint.district, complaint.state].filter(Boolean).join(', ') || '—'}</strong></div>
        {complaint.incidentDate && <div className="profile-row"><span>Incident Date</span><strong>{new Date(complaint.incidentDate).toLocaleDateString('en-IN')}</strong></div>}
        <div className="profile-row"><span>Filed</span><strong>{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</strong></div>
      </div>

      <div className="card-grid" style={{ maxWidth: 640, marginBottom: 24 }}>
        <div className="dashboard-card">
          <h3>Status</h3>
          <select value={complaint.status} disabled={busy} onChange={(e) => handleUpdate('status', e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="dashboard-card">
          <h3>Priority</h3>
          <select value={complaint.priority} disabled={busy} onChange={(e) => handleUpdate('priority', e.target.value)}>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="dashboard-card">
          <h3>Assigned Officer</h3>
          <select
            value={complaint.assignedOfficerId || ''}
            disabled={busy}
            onChange={(e) => handleUpdate('assignedOfficerId', e.target.value)}
          >
            <option value="">Unassigned</option>
            {officers.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.role.replace(/_/g, ' ')})</option>)}
          </select>
        </div>
        <div className="dashboard-card">
          <h3>Assigned Advocate</h3>
          <input
            type="text"
            defaultValue={complaint.assignedAdvocateName || ''}
            placeholder="Advocate name"
            onBlur={(e) => e.target.value !== (complaint.assignedAdvocateName || '') && handleUpdate('assignedAdvocateName', e.target.value)}
          />
        </div>
      </div>

      {complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
        <div className="profile-card" style={{ maxWidth: 640, marginBottom: 24 }}>
          <h3 className="page-subtitle">Resolve Case</h3>
          <textarea
            rows={3}
            placeholder="Resolution summary..."
            value={resolutionText}
            onChange={(e) => setResolutionText(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 7, fontFamily: 'inherit', marginBottom: 10 }}
          />
          <button className="btn btn-primary" disabled={busy} onClick={handleResolve}>Mark as Resolved</button>
        </div>
      )}

      {complaint.resolutionSummary && (
        <div className="info-banner" style={{ marginBottom: 24 }}>
          <strong>Resolution:</strong> {complaint.resolutionSummary}
        </div>
      )}

      <h3 className="page-subtitle">Evidence</h3>
      <div style={{ marginBottom: 20 }}>
        {complaint.evidences?.length > 0 ? (
          <ul>
            {complaint.evidences.map((ev) => (
              <li key={ev.id}><a href={ev.fileUrl} target="_blank" rel="noreferrer">{ev.fileUrl.split('/').pop()}</a></li>
            ))}
          </ul>
        ) : (
          <p>No evidence uploaded yet.</p>
        )}
      </div>

      <h3 className="page-subtitle">Investigation Notes & Timeline</h3>
      <ul className="timeline" style={{ maxWidth: 640 }}>
        {notes.map((n) => (
          <li key={n.id}>
            <span>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
            <div className="timeline-detail">{n.note}</div>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 8, maxWidth: 640, marginTop: 12 }}>
        <input
          type="text"
          placeholder="Add an investigation note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 7, border: '1px solid var(--line)' }}
        />
        <button className="btn btn-outline" disabled={busy} onClick={handleAddNote}>Add Note</button>
      </div>
    </div>
  )
}
