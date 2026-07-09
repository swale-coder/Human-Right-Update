import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { complaintService } from '../../services/complaintService'

const CATEGORIES = [
  'Police Misconduct',
  'Domestic Violence',
  'Child Rights Violation',
  'Women Rights Violation',
  'Labour Rights Violation',
  'Caste-Based Discrimination',
  'Land/Property Dispute',
  'Custodial Abuse',
  'Other',
]

export default function ComplaintRegister() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      const data = await complaintService.register(formData)
      setSuccess(data.complaint)
      toast.success('Complaint registered')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not register complaint')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Complaint Registered</h1>
          <div className="auth-success">
            Your complaint has been registered.
            <div style={{ marginTop: 8 }}>
              Case Number: <strong>{success.complaintNumber}</strong>
            </div>
            <div>Please keep this number for future reference.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <h1>Register a Human Rights Complaint</h1>
        <p className="auth-subtitle">All submissions are reviewed by our case officers</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="complainantName">Full Name</label>
            <input id="complainantName" type="text" {...register('complainantName', { required: 'Name is required' })} />
            {errors.complainantName && <span className="form-error">{errors.complainantName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="complainantEmail">Email</label>
            <input id="complainantEmail" type="email" {...register('complainantEmail')} />
          </div>

          <div className="form-group">
            <label htmlFor="complainantPhone">Phone</label>
            <input id="complainantPhone" type="tel" {...register('complainantPhone')} />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" {...register('category', { required: 'Category is required' })}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description of Incident</label>
            <textarea
              id="description"
              rows={5}
              style={{ padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 7, fontFamily: 'inherit', fontSize: 15, background: 'var(--cream)' }}
              {...register('description', { required: 'Please describe the incident' })}
            />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="incidentDate">Incident Date</label>
            <input id="incidentDate" type="date" {...register('incidentDate')} />
          </div>

          <div className="form-group">
            <label htmlFor="incidentLocation">Incident Location</label>
            <input id="incidentLocation" type="text" {...register('incidentLocation')} />
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

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  )
}
