import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { internService } from '../../../services/internService'
import { downloadBlob } from '../../../utils/downloadBlob'

export default function MyInternship() {
  const [intern, setIntern] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const load = () => {
    internService.getMine().then((data) => setIntern(data.intern)).catch(() => setIntern(null))
  }

  useEffect(() => { load() }, [])

  if (intern === undefined) return <div className="page-loader">Loading...</div>

  if (!intern) {
    return (
      <div>
        <h2 className="page-title">My Internship</h2>
        <div className="info-banner">
          You haven't applied for an internship yet. Visit <a href="/internship-register">the internship registration page</a> to apply.
        </div>
      </div>
    )
  }

  const handleDownload = async () => {
    setBusy(true)
    try {
      const blob = await internService.downloadCertificate(intern.id)
      downloadBlob(blob, `internship-certificate-${intern.id}.pdf`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not download certificate')
    } finally {
      setBusy(false)
    }
  }

  const onSubmitReport = async (formData) => {
    setBusy(true)
    try {
      await internService.addDailyReport(intern.id, formData)
      toast.success('Daily report submitted')
      reset()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit report')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h2 className="page-title">My Internship</h2>
      <div className="profile-card" style={{ maxWidth: 560 }}>
        <div className="profile-row"><span>Status</span><strong>{intern.status}</strong></div>
        <div className="profile-row"><span>Institution</span><strong>{intern.institution || '—'}</strong></div>
        <div className="profile-row"><span>Course</span><strong>{intern.course || '—'}</strong></div>
        {intern.evaluationScore != null && <div className="profile-row"><span>Evaluation Score</span><strong>{intern.evaluationScore}/100</strong></div>}
      </div>

      {intern.status === 'COMPLETED' && (
        <button className="btn btn-primary" disabled={busy} onClick={handleDownload} style={{ marginBottom: 24 }}>
          Download Certificate
        </button>
      )}

      {(intern.status === 'APPROVED' || intern.status === 'ONGOING') && (
        <>
          <h3 className="page-subtitle">Submit Daily Report</h3>
          <form onSubmit={handleSubmit(onSubmitReport)} style={{ maxWidth: 480, marginBottom: 24 }}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" {...register('date', { required: true })} />
            </div>
            <div className="form-group">
              <label>Report</label>
              <textarea
                rows={4}
                style={{ padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 7, fontFamily: 'inherit' }}
                {...register('report', { required: true })}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}>Submit Report</button>
          </form>
        </>
      )}

      <h3 className="page-subtitle">My Daily Reports</h3>
      <ul className="timeline" style={{ maxWidth: 560 }}>
        {(intern.reports || []).map((r) => (
          <li key={r.id}>
            <strong>{new Date(r.date).toLocaleDateString('en-IN')}</strong>
            <div className="timeline-detail">{r.report}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
