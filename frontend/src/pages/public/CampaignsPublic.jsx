import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { campaignService } from '../../services/campaignService'

export default function CampaignsPublic() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    campaignService
      .listPublic()
      .then((data) => setCampaigns(data.campaigns))
      .catch(() => toast.error('Could not load campaigns'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader">Loading campaigns...</div>

  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ color: 'var(--green-deep)' }}>Active Campaigns</h1>

      {campaigns.length === 0 && <p>No active campaigns right now.</p>}

      {campaigns.map((c) => {
        const pct = Math.min(100, Math.round((Number(c.raisedAmount) / Number(c.goalAmount)) * 100))
        return (
          <div key={c.id} className="profile-card" style={{ marginBottom: 16 }}>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <div style={{ background: 'var(--line)', borderRadius: 8, height: 10, overflow: 'hidden', margin: '12px 0' }}>
              <div style={{ background: 'var(--green-deep)', width: `${pct}%`, height: '100%' }} />
            </div>
            <p>
              Rs. {Number(c.raisedAmount).toLocaleString('en-IN')} raised of Rs. {Number(c.goalAmount).toLocaleString('en-IN')} ({pct}%)
            </p>
            <button className="btn btn-primary" onClick={() => navigate(`/donate?campaignId=${c.id}`)}>
              Donate to this Campaign
            </button>
          </div>
        )
      })}
    </div>
  )
}
