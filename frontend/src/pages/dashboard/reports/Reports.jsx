import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { reportService } from '../../../services/reportService'
import { downloadBlob } from '../../../utils/downloadBlob'

const MODULES = ['members', 'donations', 'complaints', 'volunteers', 'interns', 'events', 'beneficiaries']

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [busyModule, setBusyModule] = useState(null)

  useEffect(() => {
    reportService
      .dashboard()
      .then((data) => setSummary(data.summary))
      .catch(() => toast.error('Could not load report summary'))
  }, [])

  const handleExport = async (module) => {
    setBusyModule(module)
    try {
      const blob = await reportService.exportExcel(module)
      downloadBlob(blob, `${module}.xlsx`)
    } catch {
      toast.error('Could not export report')
    } finally {
      setBusyModule(null)
    }
  }

  return (
    <div>
      <h2 className="page-title">Reports & Analytics</h2>
      <p className="page-subtitle">Organization-wide summary and exportable reports</p>

      {summary && (
        <div className="card-grid" style={{ marginBottom: 24 }}>
          <div className="dashboard-card">
            <h3>Members</h3>
            <p>{summary.members.approved} approved / {summary.members.total} total</p>
          </div>
          <div className="dashboard-card">
            <h3>Donations</h3>
            <p>Rs. {Number(summary.donations.totalAmount).toLocaleString('en-IN')} ({summary.donations.totalCount})</p>
          </div>
          <div className="dashboard-card">
            <h3>Complaints</h3>
            <p>{summary.complaints.open} open / {summary.complaints.total} total</p>
          </div>
          <div className="dashboard-card">
            <h3>Volunteers</h3>
            <p>{summary.volunteers.active} active</p>
          </div>
          <div className="dashboard-card">
            <h3>Interns</h3>
            <p>{summary.interns.active} active</p>
          </div>
          <div className="dashboard-card">
            <h3>Events</h3>
            <p>{summary.events.upcoming} upcoming</p>
          </div>
        </div>
      )}

      <h3 className="page-subtitle">Export to Excel</h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {MODULES.map((m) => (
          <button key={m} className="btn btn-outline" disabled={busyModule === m} onClick={() => handleExport(m)}>
            {busyModule === m ? 'Exporting...' : `Export ${m.charAt(0).toUpperCase() + m.slice(1)}`}
          </button>
        ))}
      </div>
    </div>
  )
}
