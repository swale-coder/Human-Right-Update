import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await authService.forgotPassword(formData.email)
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">We'll email you a reset link</p>

        {sent ? (
          <div className="auth-success">
            If an account exists for that email, a password reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
