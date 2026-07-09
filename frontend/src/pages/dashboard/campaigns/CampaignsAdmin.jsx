import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { campaignService } from '../../../services/campaignService'

export default function CampaignsAdmin() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await campaignService.list({ limit: 50 })
      setCampaigns(data.campaigns)
    } catch {
      toast.error('Could not load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (formData) => {
    try {
      await campaignService.create({ ...formData, goalAmount: Number(formData.goalAmount) })
      toast.success('Campaign created')
      reset()
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create campaign')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await campaignService.update(id, { status })
      toast.success('Updated')
      load()
    } catch {
      toast.error('Could not update campaign')
    }
  }

  return (
    <div>
      <h2 className="page-title">Crowdfunding Campaigns</h2>
      <p className="page-subtitle">Create campaigns and track fundraising progress</p>

      <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)} style={{ marginBottom: 16 }}>
        {showForm ? 'Close' : '+ Create Campaign'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="profile-card" style={{ marginBottom: 20, maxWidth: 480 }}>
          <div className="form-group"><label>Title</label><input type="text" {...register('title', { required: true })} /></div>
          <div className="form-group"><label>Description</label><input type="text" {...register('description')} /></div>
          <div className="form-group"><label>Goal Amount (Rs.)</label><input type="number" {...register('goalAmount', { required: true })} /></div>
          <div className="form-group"><label>End Date</label><input type="date" {...register('endDate')} /></div>
          <button className="btn btn-primary" type="submit">Save Campaign</button>
        </form>
      )}

      {loading ? (
        <div className="page-loader">Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Goal</th><th>Raised</th><th>Status</th></tr></thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>Rs. {Number(c.goalAmount).toLocaleString('en-IN')}</td>
                  <td>Rs. {Number(c.raisedAmount).toLocaleString('en-IN')}</td>
                  <td>
                    <select value={c.status} onChange={(ev) => handleStatusChange(c.id, ev.target.value)}>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
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
