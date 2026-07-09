import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { memberService } from '../../services/memberService'

export default function VerifyMember() {
  const { membershipNumber } = useParams()
  const [result, setResult] = useState(undefined)
  const [error, setError] = useState(null)

  useEffect(() => {
    memberService
      .verify(membershipNumber)
      .then((data) => setResult(data))
      .catch((err) => setError(err.response?.data?.message || 'Verification failed'))
  }, [membershipNumber])

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <h1>Membership Verification</h1>
        <p className="auth-subtitle">HRPC Member Identity Check</p>

        {!result && !error && <p>Checking...</p>}

        {error && (
          <div className="auth-success" style={{ background: '#FDECEA', borderColor: '#B3261E', color: '#B3261E' }}>
            {error}
          </div>
        )}

        {result && (
          <div
            className="auth-success"
            style={
              result.valid
                ? {}
                : { background: '#FDECEA', borderColor: '#B3261E', color: '#B3261E' }
            }
          >
            <p style={{ fontWeight: 700, marginBottom: 8 }}>
              {result.valid ? '✓ Valid HRPC Member' : '✗ Membership Not Active'}
            </p>
            <p>Name: {result.member.fullName}</p>
            <p>Membership #: {result.member.membershipNumber}</p>
            <p>Type: {result.member.membershipType}</p>
            <p>Status: {result.member.status.replace(/_/g, ' ')}</p>
            {result.member.state && <p>State: {result.member.state}</p>}
            {result.member.expiryDate && (
              <p>Valid Until: {new Date(result.member.expiryDate).toLocaleDateString('en-IN')}</p>
            )}
          </div>
        )}

        <p className="auth-footer">
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
