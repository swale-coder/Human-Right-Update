import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { humanRightsLinkService } from '../../services/humanRightsLinkService'

const CATEGORY_LABELS = {
  NATIONAL_COMMISSION: 'National Commissions',
  STATE_COMMISSION: 'State Human Rights Commissions',
  JUDICIARY: 'Judiciary',
  LEGAL_SERVICES_AUTHORITY: 'Legal Services Authorities',
  SPECIALIZED_COMMISSION: 'Specialized Commissions',
  GOVERNMENT_PORTAL: 'Government Portals',
  INTERNATIONAL_BODY: 'International Bodies',
}

export default function HumanRightsLinks() {
  const [groups, setGroups] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    humanRightsLinkService
      .listPublic()
      .then((data) => setGroups(data.links || {}))
      .catch(() => toast.error('Could not load the human rights directory'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader">Loading directory...</div>

  const categories = Object.keys(groups)

  return (
    <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ color: 'var(--green-deep)' }}>Human Rights Resources Directory</h1>
      <p>Verified links to national, state, and international human rights bodies and government portals.</p>

      {categories.length === 0 && <p>No links available yet.</p>}

      {categories.map((category) => (
        <div key={category} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
            {CATEGORY_LABELS[category] || category}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {groups[category].map((link) => (
              <li key={link.id} className="profile-card" style={{ marginBottom: 10 }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
                  {link.title}
                </a>
                {link.state?.name && <span style={{ marginLeft: 8, color: 'var(--muted)' }}>({link.state.name})</span>}
                {link.description && <p style={{ margin: '4px 0 0' }}>{link.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
