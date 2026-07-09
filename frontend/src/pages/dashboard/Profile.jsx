import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

export default function Profile() {
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword)
      toast.success('Password updated successfully')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="page-title">My Profile</h2>

      <div className="profile-card">
        <div className="profile-row">
          <span>Full Name</span>
          <strong>{user?.fullName}</strong>
        </div>
        <div className="profile-row">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
        <div className="profile-row">
          <span>Phone</span>
          <strong>{user?.phone || '-'}</strong>
        </div>
        <div className="profile-row">
          <span>Role</span>
          <strong>{user?.role?.replace(/_/g, ' ')}</strong>
        </div>
      </div>

      <h3 className="page-subtitle">Change Password</h3>
      <form className="profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            {...register('currentPassword', { required: 'Current password is required' })}
          />
          {errors.currentPassword && (
            <span className="form-error">{errors.currentPassword.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            })}
          />
          {errors.newPassword && <span className="form-error">{errors.newPassword.message}</span>}
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
