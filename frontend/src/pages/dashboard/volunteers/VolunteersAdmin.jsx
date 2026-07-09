import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { volunteerService } from '../../../services/volunteerService'

export default function VolunteersAdmin() {
  const [volunteers, setVolunteers] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await volunteerService.list({ status: status || undefined, limit: 50 })
      setVolunteers(data.volunteers)
    } catch {
      toast.error('Could not load volunteers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const act = async (id, action) => {
    setBusyId(id)
    try {
      if (action === 'approve') await volunteerService.approve(id)
      if (action === 'reject') await volunteerService.reject(id)
      toast.success('Updated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h2 className="page-title">Volunteers</h2>
      <p className="page-subtitle">Review applications, approve, and manage volunteers</p>

      <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)', marginBottom: 16 }}>
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="INACTIVE">Inactive</option>
      </select>

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : volunteers.length === 0 ? (
        <div className="info-banner">No volunteers found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Skills</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id}>
                  <td>{v.user.fullName}<br /><small>{v.user.email}</small></td>
                  <td>{v.skills || '—'}</td>
                  <td><span className={`status-pill status-${v.status.toLowerCase()}`}>{v.status}</span></td>
                  <td>{v.joinedAt ? new Date(v.joinedAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    {v.status === 'PENDING' && (
                      <>
                        <button className="btn btn-primary" disabled={busyId === v.id} onClick={() => act(v.id, 'approve')}>Approve</button>{' '}
                        <button className="btn btn-outline" disabled={busyId === v.id} onClick={() => act(v.id, 'reject')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
