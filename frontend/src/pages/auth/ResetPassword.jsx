import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const password = watch('password')
  const token = searchParams.get('token') || ''

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await authService.resetPassword(token, formData.password)
      toast.success('Password reset successful. Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Invalid Link</h1>
          <p className="auth-subtitle">This password reset link is missing a token.</p>
          <p className="auth-footer">
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p className="auth-subtitle">Choose a new password</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
