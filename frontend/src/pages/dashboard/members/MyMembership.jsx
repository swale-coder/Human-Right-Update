import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { memberService } from '../../../services/memberService'
import { downloadBlob } from '../../../utils/downloadBlob'

const STATUS_LABELS = {
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  RENEWAL_PENDING: 'Renewal Pending',
}

export default function MyMembership() {
  const [member, setMember] = useState(undefined) // undefined = loading, null = none yet
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const data = await memberService.getMine()
      setMember(data.member)
    } catch {
      toast.error('Could not load membership details')
      setMember(null)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (member === undefined) {
    return <div className="page-loader">Loading...</div>
  }

  if (member === null) {
    return <ApplyForm onApplied={load} />
  }

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const fn = type === 'photo' ? memberService.uploadPhoto : memberService.uploadDocument
      const data = await fn(member.id, file)
      setMember(data.member)
      toast.success(`${type === 'photo' ? 'Photo' : 'Document'} uploaded`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = async (kind) => {
    setBusy(true)
    try {
      const fn = kind === 'certificate' ? memberService.downloadCertificate : memberService.downloadIdCard
      const blob = await fn(member.id)
      downloadBlob(blob, `${kind}-${member.membershipNumber}.pdf`)
    } catch {
      toast.error('Could not download file')
    } finally {
      setBusy(false)
    }
  }

  const handleRenew = async () => {
    setBusy(true)
    try {
      const data = await memberService.requestRenewal(member.id)
      setMember(data.member)
      toast.success('Renewal requested')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not request renewal')
    } finally {
      setBusy(false)
    }
  }

  const isExpiringSoon =
    member.expiryDate && new Date(member.expiryDate) < new Date(Date.now() + 30 * 86400000)

  return (
    <div>
      <h2 className="page-title">My Membership</h2>

      <div className="profile-card" style={{ maxWidth: 560 }}>
        <div className="profile-row">
          <span>Status</span>
          <strong>{STATUS_LABELS[member.status]}</strong>
        </div>
        <div className="profile-row">
          <span>Membership Number</span>
          <strong>{member.membershipNumber || 'Not yet assigned'}</strong>
        </div>
        <div className="profile-row">
          <span>Type</span>
          <strong>{member.membershipType}</strong>
        </div>
        {member.joinDate && (
          <div className="profile-row">
            <span>Joined</span>
            <strong>{new Date(member.joinDate).toLocaleDateString('en-IN')}</strong>
          </div>
        )}
        {member.expiryDate && (
          <div className="profile-row">
            <span>Valid Until</span>
            <strong>{new Date(member.expiryDate).toLocaleDateString('en-IN')}</strong>
          </div>
        )}
        {member.status === 'REJECTED' && member.rejectionReason && (
          <div className="profile-row">
            <span>Reason</span>
            <strong>{member.rejectionReason}</strong>
          </div>
        )}
      </div>

      {member.status === 'PENDING' && (
        <div className="info-banner">
          Your membership application is under review. You'll be notified once it's approved.
        </div>
      )}

      {(member.status === 'APPROVED' || member.status === 'RENEWAL_PENDING') && (
        <>
          {isExpiringSoon && member.status === 'APPROVED' && (
            <div className="info-banner" style={{ marginBottom: 16 }}>
              Your membership is expiring soon.{' '}
              <button className="btn btn-outline" disabled={busy} onClick={handleRenew}>
                Request Renewal
              </button>
            </div>
          )}
          {member.status === 'RENEWAL_PENDING' && (
            <div className="info-banner" style={{ marginBottom: 16 }}>
              Your renewal request is pending admin approval.
            </div>
          )}

          <h3 className="page-subtitle">Downloads</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button className="btn btn-primary" disabled={busy} onClick={() => handleDownload('certificate')}>
              Download Certificate
            </button>
            <button className="btn btn-outline" disabled={busy} onClick={() => handleDownload('id-card')}>
              Download ID Card
            </button>
          </div>
        </>
      )}

      <h3 className="page-subtitle">Documents</h3>
      <div className="card-grid" style={{ maxWidth: 560 }}>
        <div className="dashboard-card">
          <h3>Photo</h3>
          {member.photoUrl ? (
            <img src={member.photoUrl} alt="Member" style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />
          ) : (
            <p>No photo uploaded</p>
          )}
          <input type="file" accept="image/*" disabled={busy} onChange={(e) => handleUpload(e, 'photo')} />
        </div>
        <div className="dashboard-card">
          <h3>ID Proof</h3>
          {member.idProofUrl ? (
            <p>
              <a href={member.idProofUrl} target="_blank" rel="noreferrer">
                View uploaded document
              </a>
            </p>
          ) : (
            <p>No document uploaded</p>
          )}
          <input
            type="file"
            accept="image/*,application/pdf"
            disabled={busy}
            onChange={(e) => handleUpload(e, 'document')}
          />
        </div>
      </div>
    </div>
  )
}

function ApplyForm({ onApplied }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await memberService.apply(formData)
      toast.success('Application submitted!')
      onApplied()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="page-title">Apply for Membership</h2>
      <p className="page-subtitle">Fill in your details to apply for HRPC membership</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ maxWidth: 480 }}>
        <div className="form-group">
          <label htmlFor="membershipType">Membership Type</label>
          <select id="membershipType" {...register('membershipType')}>
            <option value="GENERAL">General</option>
            <option value="LIFE">Life</option>
            <option value="STUDENT">Student</option>
            <option value="HONORARY">Honorary</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" {...register('gender')}>
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fatherOrSpouseName">Father's / Spouse's Name</label>
          <input id="fatherOrSpouseName" type="text" {...register('fatherOrSpouseName')} />
        </div>

        <div className="form-group">
          <label htmlFor="occupation">Occupation</label>
          <input id="occupation" type="text" {...register('occupation')} />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input id="address" type="text" {...register('address')} />
        </div>

        <div className="form-group">
          <label htmlFor="state">State</label>
          <input id="state" type="text" placeholder="Gujarat" {...register('state')} />
        </div>

        <div className="form-group">
          <label htmlFor="district">District</label>
          <input id="district" type="text" {...register('district')} />
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <input id="city" type="text" {...register('city')} />
        </div>

        <div className="form-group">
          <label htmlFor="pincode">Pincode</label>
          <input id="pincode" type="text" {...register('pincode')} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
