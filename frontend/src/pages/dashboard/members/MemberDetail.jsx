import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { memberService } from '../../../services/memberService'
import { downloadBlob } from '../../../utils/downloadBlob'

export default function MemberDetail() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [memberData, historyData] = await Promise.all([
        memberService.getOne(id),
        memberService.history(id).catch(() => ({ history: [] })),
      ])
      setMember(memberData.member)
      setHistory(historyData.history)
    } catch {
      toast.error('Could not load member')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleApprove = async () => {
    setBusy(true)
    try {
      const data = await memberService.approve(id)
      setMember(data.member)
      toast.success('Member approved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve')
    } finally {
      setBusy(false)
    }
  }

  const handleReject = async () => {
    const reason = window.prompt('Reason for rejection:')
    if (!reason) return
    setBusy(true)
    try {
      const data = await memberService.reject(id, reason)
      setMember(data.member)
      toast.success('Member rejected')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject')
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = async (kind) => {
    setBusy(true)
    try {
      const fn = kind === 'certificate' ? memberService.downloadCertificate : memberService.downloadIdCard
      const blob = await fn(id)
      downloadBlob(blob, `${kind}-${member.membershipNumber}.pdf`)
    } catch {
      toast.error('Could not download file')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="page-loader">Loading...</div>
  if (!member) return <div className="info-banner">Member not found.</div>

  return (
    <div>
      <Link to="/dashboard/members">&larr; Back to Members</Link>
      <h2 className="page-title" style={{ marginTop: 12 }}>{member.user.fullName}</h2>
      <p className="page-subtitle">{member.user.email} · {member.user.phone}</p>

      <div className="profile-card" style={{ maxWidth: 600 }}>
        <div className="profile-row"><span>Status</span><strong>{member.status.replace(/_/g, ' ')}</strong></div>
        <div className="profile-row"><span>Membership #</span><strong>{member.membershipNumber || '—'}</strong></div>
        <div className="profile-row"><span>Type</span><strong>{member.membershipType}</strong></div>
        <div className="profile-row"><span>Gender</span><strong>{member.gender || '—'}</strong></div>
        <div className="profile-row"><span>DOB</span><strong>{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-IN') : '—'}</strong></div>
        <div className="profile-row"><span>Father/Spouse</span><strong>{member.fatherOrSpouseName || '—'}</strong></div>
        <div className="profile-row"><span>Occupation</span><strong>{member.occupation || '—'}</strong></div>
        <div className="profile-row"><span>Address</span><strong>{member.address || '—'}</strong></div>
        <div className="profile-row"><span>Location</span><strong>{[member.city, member.taluka, member.district, member.state].filter(Boolean).join(', ') || '—'}</strong></div>
        <div className="profile-row"><span>Pincode</span><strong>{member.pincode || '—'}</strong></div>
        {member.joinDate && <div className="profile-row"><span>Joined</span><strong>{new Date(member.joinDate).toLocaleDateString('en-IN')}</strong></div>}
        {member.expiryDate && <div className="profile-row"><span>Expires</span><strong>{new Date(member.expiryDate).toLocaleDateString('en-IN')}</strong></div>}
        {member.rejectionReason && <div className="profile-row"><span>Rejection Reason</span><strong>{member.rejectionReason}</strong></div>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {member.status === 'PENDING' && (
          <>
            <button className="btn btn-primary" disabled={busy} onClick={handleApprove}>Approve</button>
            <button className="btn btn-outline" disabled={busy} onClick={handleReject}>Reject</button>
          </>
        )}
        {member.status === 'APPROVED' && (
          <>
            <button className="btn btn-primary" disabled={busy} onClick={() => handleDownload('certificate')}>Download Certificate</button>
            <button className="btn btn-outline" disabled={busy} onClick={() => handleDownload('id-card')}>Download ID Card</button>
          </>
        )}
      </div>

      <div className="card-grid" style={{ maxWidth: 500, marginBottom: 24 }}>
        <div className="dashboard-card">
          <h3>Photo</h3>
          {member.photoUrl ? (
            <img src={member.photoUrl} alt="Member" style={{ width: '100%', borderRadius: 6 }} />
          ) : (
            <p>Not uploaded</p>
          )}
        </div>
        <div className="dashboard-card">
          <h3>ID Proof</h3>
          {member.idProofUrl ? (
            <a href={member.idProofUrl} target="_blank" rel="noreferrer">View document</a>
          ) : (
            <p>Not uploaded</p>
          )}
        </div>
      </div>

      <h3 className="page-subtitle">Activity History</h3>
      <ul className="timeline">
        {history.length === 0 && <li>No activity recorded yet.</li>}
        {history.map((log) => (
          <li key={log.id}>
            <strong>{log.action.replace(/_/g, ' ')}</strong>
            <span> — {new Date(log.createdAt).toLocaleString('en-IN')}</span>
            {log.details && <div className="timeline-detail">{log.details}</div>}
          </li>
        ))}
      </ul>
    </div>
  )
}
