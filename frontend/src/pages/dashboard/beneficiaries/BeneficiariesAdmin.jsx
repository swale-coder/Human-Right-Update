import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { beneficiaryService } from '../../../services/beneficiaryService'

export default function BeneficiariesAdmin() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await beneficiaryService.list({ limit: 50 })
      setBeneficiaries(data.beneficiaries)
    } catch {
      toast.error('Could not load beneficiaries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (formData) => {
    try {
      await beneficiaryService.create(formData)
      toast.success('Beneficiary registered')
      reset()
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not register beneficiary')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await beneficiaryService.update(id, { status })
      toast.success('Updated')
      load()
    } catch {
      toast.error('Could not update beneficiary')
    }
  }

  return (
    <div>
      <h2 className="page-title">Beneficiaries</h2>
      <p className="page-subtitle">Track legal, financial, medical & education assistance cases</p>

      <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)} style={{ marginBottom: 16 }}>
        {showForm ? 'Close' : '+ Register Beneficiary'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="profile-card" style={{ marginBottom: 20, maxWidth: 480 }}>
          <div className="form-group"><label>Full Name</label><input type="text" {...register('fullName', { required: true })} /></div>
          <div className="form-group"><label>Email</label><input type="email" {...register('email')} /></div>
          <div className="form-group"><label>Phone</label><input type="tel" {...register('phone')} /></div>
          <div className="form-group">
            <label>Support Type</label>
            <select {...register('supportType', { required: true })}>
              <option value="LEGAL">Legal</option>
              <option value="FINANCIAL">Financial</option>
              <option value="MEDICAL">Medical</option>
              <option value="EDUCATION">Education</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="form-group"><label>Description</label><input type="text" {...register('description')} /></div>
          <button className="btn btn-primary" type="submit">Save</button>
        </form>
      )}

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Code</th><th>Name</th><th>Support Type</th><th>Status</th></tr></thead>
            <tbody>
              {beneficiaries.map((b) => (
                <tr key={b.id}>
                  <td>{b.beneficiaryCode}</td>
                  <td>{b.fullName}</td>
                  <td>{b.supportType}</td>
                  <td>
                    <select value={b.status} onChange={(ev) => handleStatusChange(b.id, ev.target.value)}>
                      <option value="REGISTERED">Registered</option>
                      <option value="ASSISTANCE_PROVIDED">Assistance Provided</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
