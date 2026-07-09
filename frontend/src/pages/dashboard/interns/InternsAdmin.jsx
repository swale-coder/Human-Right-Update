import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { internService } from '../../../services/internService'

export default function InternsAdmin() {
  const [interns, setInterns] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await internService.list({ status: status || undefined, limit: 50 })
      setInterns(data.interns)
    } catch {
      toast.error('Could not load interns')
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
      if (action === 'approve') await internService.approve(id)
      if (action === 'reject') await internService.reject(id)
      if (action === 'evaluate') {
        const score = window.prompt('Score (0-100):')
        const remarks = window.prompt('Remarks:')
        if (score) await internService.evaluate(id, Number(score), remarks)
      }
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
      <h2 className="page-title">Internships</h2>
      <p className="page-subtitle">Review applications, assign mentors, evaluate completion</p>

      <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)', marginBottom: 16 }}>
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="ONGOING">Ongoing</option>
        <option value="COMPLETED">Completed</option>
        <option value="REJECTED">Rejected</option>
      </select>

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : interns.length === 0 ? (
        <div className="info-banner">No interns found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Institution</th><th>Course</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {interns.map((i) => (
                <tr key={i.id}>
                  <td>{i.user.fullName}<br /><small>{i.user.email}</small></td>
                  <td>{i.institution || '—'}</td>
                  <td>{i.course || '—'}</td>
                  <td><span className={`status-pill status-${i.status.toLowerCase()}`}>{i.status}</span></td>
                  <td>
                    {i.status === 'PENDING' && (
                      <>
                        <button className="btn btn-primary" disabled={busyId === i.id} onClick={() => act(i.id, 'approve')}>Approve</button>{' '}
                        <button className="btn btn-outline" disabled={busyId === i.id} onClick={() => act(i.id, 'reject')}>Reject</button>
                      </>
                    )}
                    {(i.status === 'APPROVED' || i.status === 'ONGOING') && (
                      <button className="btn btn-primary" disabled={busyId === i.id} onClick={() => act(i.id, 'evaluate')}>Evaluate & Complete</button>
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
