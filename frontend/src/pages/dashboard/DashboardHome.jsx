import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

export default function DashboardHome() {
  const { user } = useAuth()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'NATIONAL_ADMIN'

  const cards = isAdmin
    ? [
        { to: '/dashboard/members', title: 'Membership', desc: 'Manage member applications & approvals' },
        { to: '/dashboard/donations', title: 'Donations', desc: 'View donations & financial summary' },
        { to: '/dashboard/complaints', title: 'Complaints', desc: 'Manage & resolve human rights cases' },
        { to: '/dashboard/beneficiaries', title: 'Beneficiaries', desc: 'Track legal/financial/medical assistance cases' },
        { to: '/dashboard/volunteers', title: 'Volunteers', desc: 'Approve volunteers, assign tasks & attendance' },
        { to: '/dashboard/interns', title: 'Internships', desc: 'Manage applications, mentors & evaluations' },
        { to: '/dashboard/events', title: 'Events', desc: 'Create events & track registrations' },
        { to: '/dashboard/campaigns', title: 'Crowdfunding', desc: 'Run fundraising campaigns' },
        { to: '/dashboard/reports', title: 'Reports & Analytics', desc: 'Organization-wide summary & Excel exports' },
      ]
    : [
        { to: '/dashboard/my-membership', title: 'Membership', desc: 'View or apply for your membership' },
        { to: '/dashboard/my-donations', title: 'Donations', desc: 'View your donation history & receipts' },
        { to: '/dashboard/my-complaints', title: 'Complaints', desc: 'Track complaints you have filed' },
        { to: '/dashboard/my-volunteering', title: 'Volunteering', desc: 'View your volunteer status & tasks' },
        { to: '/dashboard/my-internship', title: 'Internship', desc: 'Track your internship & daily reports' },
      ]

  if (isSuperAdmin) {
    cards.push({ to: '/dashboard/super-admin', title: 'Super Admin Panel', desc: 'Organization structure, roles & settings' })
  }

  return (
    <div>
      <h2 className="page-title">Welcome, {user?.fullName}</h2>
      <p className="page-subtitle">
        Role: <strong>{user?.role?.replace(/_/g, ' ')}</strong>
      </p>

      <div className="card-grid">
        {cards.map((c) => (
          <Link className="dashboard-card" to={c.to} key={c.to}>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="info-banner">
        All 15 planned phases of the HRPC ERP are now live: Membership, Donations, Complaints,
        Beneficiaries, Volunteers, Internships, Events, Crowdfunding, Certificates, Digital ID
        Cards, Reports &amp; Analytics, and the Super Admin Panel.
      </div>
    </div>
  )
}
