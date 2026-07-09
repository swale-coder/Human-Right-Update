import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { donationService } from '../../../services/donationService'
import { downloadBlob } from '../../../utils/downloadBlob'

export default function DonationsAdmin() {
  const [donations, setDonations] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [summary, setSummary] = useState(null)
  const [status, setStatus] = useState('')
  const [mode, setMode] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const [listData, summaryData] = await Promise.all([
        donationService.list({ page, limit: 15, status: status || undefined, mode: mode || undefined, search: search || undefined }),
        donationService.summary(),
      ])
      setDonations(listData.donations)
      setPagination(listData.pagination)
      setSummary(summaryData.summary)
    } catch {
      toast.error('Could not load donations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, mode])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load(1)
  }

  const handleDownload = async (id, receiptNumber) => {
    setBusyId(id)
    try {
      const blob = await donationService.downloadReceipt(id)
      downloadBlob(blob, `receipt-${receiptNumber}.pdf`)
    } catch {
      toast.error('Could not download receipt')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h2 className="page-title">Donations</h2>
      <p className="page-subtitle">Track online & offline donations and financial summaries</p>

      {summary && (
        <div className="card-grid" style={{ marginBottom: 24 }}>
          <div className="dashboard-card">
            <h3>Total Raised</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>
              Rs. {summary.totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="dashboard-card">
            <h3>Total Donations</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>{summary.totalCount}</p>
          </div>
          <div className="dashboard-card">
            <h3>Recurring Donors</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>{summary.recurringCount}</p>
          </div>
          <div className="dashboard-card">
            <h3>Online vs Offline</h3>
            <p>Online: Rs. {(summary.byMode.ONLINE || 0).toLocaleString('en-IN')}</p>
            <p>Offline: Rs. {(summary.byMode.OFFLINE || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Search by donor, email, or receipt #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)', minWidth: 260 }}
          />
          <button className="btn btn-outline" type="submit">Search</button>
        </form>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)' }}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)' }}>
          <option value="">All Modes</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>

        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close' : '+ Record Offline Donation'}
        </button>
      </div>

      {showForm && (
        <OfflineDonationForm
          onSaved={() => {
            setShowForm(false)
            load(pagination.page)
          }}
        />
      )}

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : donations.length === 0 ? (
        <div className="info-banner">No donations found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{d.donorName}<br /><small>{d.donorEmail}</small></td>
                  <td>Rs. {Number(d.amount).toLocaleString('en-IN')}</td>
                  <td>{d.mode}</td>
                  <td><span className={`status-pill status-${d.status.toLowerCase()}`}>{d.status}</span></td>
                  <td>{new Date(d.donatedAt || d.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    {d.status === 'SUCCESS' && (
                      <button className="btn btn-outline" disabled={busyId === d.id} onClick={() => handleDownload(d.id, d.receiptNumber)}>
                        Receipt
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
            <button key={p} className={`btn ${p === pagination.page ? 'btn-primary' : 'btn-outline'}`} onClick={() => load(p)}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function OfflineDonationForm({ onSaved }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await donationService.recordOffline({ ...formData, amount: Number(formData.amount) })
      toast.success('Offline donation recorded')
      reset()
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record donation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="profile-card" style={{ marginBottom: 20 }}>
      <div className="form-group">
        <label>Donor Name</label>
        <input type="text" {...register('donorName', { required: 'Required' })} />
        {errors.donorName && <span className="form-error">{errors.donorName.message}</span>}
      </div>
      <div className="form-group">
        <label>Amount (Rs.)</label>
        <input type="number" min="1" {...register('amount', { required: 'Required', min: 1 })} />
        {errors.amount && <span className="form-error">{errors.amount.message}</span>}
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" {...register('donorEmail')} />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input type="tel" {...register('donorPhone')} />
      </div>
      <div className="form-group">
        <label>PAN Number (for 80G)</label>
        <input type="text" {...register('panNumber')} />
      </div>
      <div className="form-group">
        <label>Purpose</label>
        <input type="text" {...register('purpose')} />
      </div>
      <div className="form-group">
        <label>Donation Date</label>
        <input type="date" {...register('donatedAt')} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Donation'}
      </button>
    </form>
  )
}
