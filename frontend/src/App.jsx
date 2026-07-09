import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

import PublicLayout from './pages/public/PublicLayout'
import Home from './pages/public/Home'
import NotFound from './pages/public/NotFound'
import VerifyMember from './pages/public/VerifyMember'
import Donate from './pages/public/Donate'
import ComplaintRegister from './pages/public/ComplaintRegister'
import VolunteerRegister from './pages/public/VolunteerRegister'
import InternshipRegister from './pages/public/InternshipRegister'
import EventsPublic from './pages/public/EventsPublic'
import CampaignsPublic from './pages/public/CampaignsPublic'
import HumanRightsLinks from './pages/public/HumanRightsLinks'
import Gallery from './pages/public/Gallery'
import News from './pages/public/News'
import Leadership from './pages/public/Leadership'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import Profile from './pages/dashboard/Profile'
import MyMembership from './pages/dashboard/members/MyMembership'
import MembersList from './pages/dashboard/members/MembersList'
import MemberDetail from './pages/dashboard/members/MemberDetail'
import MyDonations from './pages/dashboard/donations/MyDonations'
import DonationsAdmin from './pages/dashboard/donations/DonationsAdmin'
import MyComplaints from './pages/dashboard/complaints/MyComplaints'
import ComplaintsList from './pages/dashboard/complaints/ComplaintsList'
import ComplaintDetail from './pages/dashboard/complaints/ComplaintDetail'
import MyVolunteering from './pages/dashboard/volunteers/MyVolunteering'
import VolunteersAdmin from './pages/dashboard/volunteers/VolunteersAdmin'
import MyInternship from './pages/dashboard/interns/MyInternship'
import InternsAdmin from './pages/dashboard/interns/InternsAdmin'
import EventsAdmin from './pages/dashboard/events/EventsAdmin'
import CampaignsAdmin from './pages/dashboard/campaigns/CampaignsAdmin'
import HumanRightsLinksAdmin from './pages/dashboard/humanrights/HumanRightsLinksAdmin'
import BeneficiariesAdmin from './pages/dashboard/beneficiaries/BeneficiariesAdmin'
import Reports from './pages/dashboard/reports/Reports'
import SuperAdminPanel from './pages/dashboard/superadmin/SuperAdminPanel'

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="/verify-member/:membershipNumber" element={<VerifyMember />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/register-complaint" element={<ComplaintRegister />} />
          <Route path="/volunteer-register" element={<VolunteerRegister />} />
          <Route path="/internship-register" element={<InternshipRegister />} />
          <Route path="/events" element={<EventsPublic />} />
          <Route path="/campaigns" element={<CampaignsPublic />} />
          <Route path="/human-rights-links" element={<HumanRightsLinks />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/news" element={<News />} />
          <Route path="/leadership" element={<Leadership />} />

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected dashboard - any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<Profile />} />
              <Route path="my-membership" element={<MyMembership />} />
              <Route path="my-donations" element={<MyDonations />} />
              <Route path="my-complaints" element={<MyComplaints />} />
              <Route path="my-volunteering" element={<MyVolunteering />} />
              <Route path="my-internship" element={<MyInternship />} />
            </Route>
          </Route>

          {/* Admin-only modules */}
          <Route element={<ProtectedRoute roles={ADMIN_ROLES} />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="members" element={<MembersList />} />
              <Route path="members/:id" element={<MemberDetail />} />
              <Route path="donations" element={<DonationsAdmin />} />
              <Route path="complaints" element={<ComplaintsList />} />
              <Route path="complaints/:id" element={<ComplaintDetail />} />
              <Route path="volunteers" element={<VolunteersAdmin />} />
              <Route path="interns" element={<InternsAdmin />} />
              <Route path="events" element={<EventsAdmin />} />
              <Route path="campaigns" element={<CampaignsAdmin />} />
              <Route path="human-rights-links" element={<HumanRightsLinksAdmin />} />
              <Route path="beneficiaries" element={<BeneficiariesAdmin />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Super Admin only */}
          <Route element={<ProtectedRoute roles={['SUPER_ADMIN', 'NATIONAL_ADMIN']} />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="super-admin" element={<SuperAdminPanel />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
