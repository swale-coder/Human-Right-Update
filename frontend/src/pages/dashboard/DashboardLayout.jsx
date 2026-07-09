import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/NotificationBell'

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const isAdmin = ADMIN_ROLES.includes(user?.role)

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'NATIONAL_ADMIN'

  const navItems = [
    { to: '/dashboard', label: 'Overview', end: true },
    ...(isAdmin
      ? [
          { to: '/dashboard/members', label: 'Members' },
          { to: '/dashboard/donations', label: 'Donations' },
          { to: '/dashboard/complaints', label: 'Complaints' },
          { to: '/dashboard/beneficiaries', label: 'Beneficiaries' },
          { to: '/dashboard/volunteers', label: 'Volunteers' },
          { to: '/dashboard/interns', label: 'Internships' },
          { to: '/dashboard/events', label: 'Events' },
          { to: '/dashboard/campaigns', label: 'Campaigns' },
          { to: '/dashboard/human-rights-links', label: 'Human Rights Links' },
          { to: '/dashboard/reports', label: 'Reports' },
        ]
      : [
          { to: '/dashboard/my-membership', label: 'My Membership' },
          { to: '/dashboard/my-donations', label: 'My Donations' },
          { to: '/dashboard/my-complaints', label: 'My Complaints' },
          { to: '/dashboard/my-volunteering', label: 'My Volunteering' },
          { to: '/dashboard/my-internship', label: 'My Internship' },
        ]),
    ...(isSuperAdmin ? [{ to: '/dashboard/super-admin', label: 'Super Admin' }] : []),
    { to: '/dashboard/profile', label: 'My Profile' },
  ]

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">HRPC ERP</div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dashboard-nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-user">
            <span className="dashboard-user-name">{user?.fullName}</span>
            <span className="dashboard-user-role">{user?.role?.replace(/_/g, ' ')}</span>
          </div>
          <NotificationBell />
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
