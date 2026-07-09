import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { complaintService } from '../../../services/complaintService'

const STATUS_OPTIONS = ['', 'REGISTERED', 'UNDER_INVESTIGATION', 'RESOLVED', 'REJECTED', 'CLOSED']
const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [summary, setSummary] = useState(null)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const [listData, summaryData] = await Promise.all([
        complaintService.list({ page, limit: 15, status: status || undefined, priority: priority || undefined, search: search || undefined }),
        complaintService.summary(),
      ])
      setComplaints(listData.complaints)
      setPagination(listData.pagination)
      setSummary(summaryData.summary)
    } catch {
      toast.error('Could not load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load(1)
  }

  return (
    <div>
      <h2 className="page-title">Complaints & Case Management</h2>
      <p className="page-subtitle">Track, assign, and resolve human rights complaints</p>

      {summary && (
        <div className="card-grid" style={{ marginBottom: 24 }}>
          <div className="dashboard-card">
            <h3>Total Cases</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>{summary.total}</p>
          </div>
          <div className="dashboard-card">
            <h3>Under Investigation</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>{summary.byStatus.UNDER_INVESTIGATION || 0}</p>
          </div>
          <div className="dashboard-card">
            <h3>Resolved</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>{summary.byStatus.RESOLVED || 0}</p>
          </div>
          <div className="dashboard-card">
            <h3>Critical Priority</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>{summary.byPriority.CRITICAL || 0}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Search by case #, name, or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)', minWidth: 280 }}
          />
          <button className="btn btn-outline" type="submit">Search</button>
        </form>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)' }}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Statuses'}</option>
          ))}
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)' }}>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p || 'All Priorities'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : complaints.length === 0 ? (
        <div className="info-banner">No complaints found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Case #</th>
                <th>Complainant</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Filed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.complaintNumber}</td>
                  <td>{c.complainantName}</td>
                  <td>{c.category}</td>
                  <td>{c.priority}</td>
                  <td><span className={`status-pill status-${c.status.toLowerCase()}`}>{c.status.replace(/_/g, ' ')}</span></td>
                  <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><Link className="btn btn-outline" to={`/dashboard/complaints/${c.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`btn ${p === pagination.page ? 'btn-primary' : 'btn-outline'}`} onClick={() => load(p)}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
