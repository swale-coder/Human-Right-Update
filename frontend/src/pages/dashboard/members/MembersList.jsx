import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { memberService } from '../../../services/memberService'

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'RENEWAL_PENDING']

export default function MembersList() {
  const [members, setMembers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const data = await memberService.list({ page, limit: 15, status: status || undefined, search: search || undefined })
      setMembers(data.members)
      setPagination(data.pagination)
    } catch {
      toast.error('Could not load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load(1)
  }

  const handleApprove = async (id) => {
    setBusyId(id)
    try {
      await memberService.approve(id)
      toast.success('Member approved')
      load(pagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve member')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:')
    if (!reason) return
    setBusyId(id)
    try {
      await memberService.reject(id, reason)
      toast.success('Member rejected')
      load(pagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject member')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h2 className="page-title">Members</h2>
      <p className="page-subtitle">Manage membership applications, approvals, and renewals</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Search by name, email, or membership #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)', minWidth: 280 }}
          />
          <button className="btn btn-outline" type="submit">Search</button>
        </form>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Statuses'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : members.length === 0 ? (
        <div className="info-banner">No members found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Membership #</th>
                <th>Type</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>{m.user.fullName}<br /><small>{m.user.email}</small></td>
                  <td>{m.membershipNumber || '—'}</td>
                  <td>{m.membershipType}</td>
                  <td><span className={`status-pill status-${m.status.toLowerCase()}`}>{m.status.replace(/_/g, ' ')}</span></td>
                  <td>{new Date(m.appliedAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Link className="btn btn-outline" to={`/dashboard/members/${m.id}`}>View</Link>
                    {m.status === 'PENDING' && (
                      <>
                        <button className="btn btn-primary" disabled={busyId === m.id} onClick={() => handleApprove(m.id)}>
                          Approve
                        </button>
                        <button className="btn btn-outline" disabled={busyId === m.id} onClick={() => handleReject(m.id)}>
                          Reject
                        </button>
                      </>
                    )}
                    {m.status === 'RENEWAL_PENDING' && (
                      <button
                        className="btn btn-primary"
                        disabled={busyId === m.id}
                        onClick={async () => {
                          setBusyId(m.id)
                          try {
                            await memberService.approveRenewal(m.id)
                            toast.success('Renewal approved')
                            load(pagination.page)
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Could not approve renewal')
                          } finally {
                            setBusyId(null)
                          }
                        }}
                      >
                        Approve Renewal
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`btn ${p === pagination.page ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => load(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
