import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { volunteerService } from '../../services/volunteerService'

export default function VolunteerRegister() {
  const { isAuthenticated } = useAuth()
  const { register, handleSubmit } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Become a Volunteer</h1>
          <p className="auth-subtitle">Please sign in or create an account first</p>
          <Link className="btn btn-primary btn-block" to="/login">Sign In</Link>
          <p className="auth-footer"><Link to="/register">Create an account</Link></p>
        </div>
      </div>
    )
  }

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await volunteerService.register(formData)
      setSuccess(true)
      toast.success('Application submitted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit application')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Thank You!</h1>
          <div className="auth-success">Your volunteer application has been submitted for review.</div>
          <p className="auth-footer"><Link to="/dashboard/my-membership">Go to Dashboard</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Become a Volunteer</h1>
        <p className="auth-subtitle">Tell us about your skills and availability</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="skills">Skills / Areas of Interest</label>
            <textarea
              id="skills"
              rows={4}
              style={{ padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 7, fontFamily: 'inherit' }}
              {...register('skills')}
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
