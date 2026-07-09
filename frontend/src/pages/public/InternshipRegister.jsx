import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { internService } from '../../services/internService'

export default function InternshipRegister() {
  const { isAuthenticated } = useAuth()
  const { register, handleSubmit } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Apply for Internship</h1>
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
      await internService.register(formData)
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
          <div className="auth-success">Your internship application has been submitted for review.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Apply for Internship</h1>
        <p className="auth-subtitle">Tell us about your academic background</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="institution">Institution</label>
            <input id="institution" type="text" {...register('institution')} />
          </div>
          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input id="course" type="text" {...register('course')} />
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Preferred Start Date</label>
            <input id="startDate" type="date" {...register('startDate')} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">Preferred End Date</label>
            <input id="endDate" type="date" {...register('endDate')} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
