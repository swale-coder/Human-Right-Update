const crypto = require('crypto')
const bcrypt = require('bcryptjs')

function id() {
  return crypto.randomUUID()
}

function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000)
}

// Fixed on purpose so the README's demo credentials always work regardless
// of whatever is (or isn't) set in .env.
const DEMO_PASSWORD = 'Demo@1234'
const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10)

// ---------------------------------------------------------------------------
// db: every array is a "table". Every record always has id/createdAt/updatedAt
// like a real Prisma model instance would.
// ---------------------------------------------------------------------------
const db = {
  user: [],
  refreshToken: [],
  passwordReset: [],
  activityLog: [],
  state: [],
  district: [],
  taluka: [],
  city: [],
  member: [],
  donation: [],
  complaint: [],
  complaintEvidence: [],
  complaintNote: [],
  beneficiary: [],
  volunteer: [],
  volunteerAttendance: [],
  volunteerTask: [],
  intern: [],
  internAttendance: [],
  internDailyReport: [],
  event: [],
  eventRegistration: [],
  campaign: [],
  campaignUpdate: [],
  systemSetting: [],
  humanRightsLink: [],
  notification: [],
}

function baseRecord(extra) {
  return { id: id(), createdAt: new Date(), updatedAt: new Date(), ...extra }
}

// ---------- Geography ----------
const GEOGRAPHY = [
  {
    name: 'Maharashtra',
    code: 'MH',
    districts: [
      { name: 'Pune', talukas: [{ name: 'Haveli', cities: ['Pune City', 'Hadapsar'] }, { name: 'Baramati', cities: ['Baramati'] }] },
      { name: 'Mumbai City', talukas: [{ name: 'Mumbai', cities: ['Andheri', 'Dadar'] }] },
      { name: 'Nagpur', talukas: [{ name: 'Nagpur Urban', cities: ['Nagpur City'] }] },
    ],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    districts: [
      { name: 'Bengaluru Urban', talukas: [{ name: 'Bengaluru North', cities: ['Hebbal'] }, { name: 'Bengaluru South', cities: ['Jayanagar'] }] },
      { name: 'Mysuru', talukas: [{ name: 'Mysuru', cities: ['Mysuru City'] }] },
    ],
  },
  {
    name: 'Delhi',
    code: 'DL',
    districts: [
      { name: 'New Delhi', talukas: [{ name: 'New Delhi Tehsil', cities: ['Connaught Place'] }] },
      { name: 'South Delhi', talukas: [{ name: 'Saket Tehsil', cities: ['Saket'] }] },
    ],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    districts: [
      { name: 'Chennai', talukas: [{ name: 'Chennai Central', cities: ['T. Nagar'] }] },
      { name: 'Coimbatore', talukas: [{ name: 'Coimbatore North', cities: ['Coimbatore City'] }] },
    ],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    districts: [
      { name: 'Lucknow', talukas: [{ name: 'Lucknow Sadar', cities: ['Hazratganj'] }] },
      { name: 'Varanasi', talukas: [{ name: 'Varanasi Sadar', cities: ['Varanasi City'] }] },
    ],
  },
]

const stateRefs = {}
for (const stateDef of GEOGRAPHY) {
  const state = baseRecord({ name: stateDef.name, code: stateDef.code })
  db.state.push(state)
  stateRefs[state.name] = { id: state.id, districts: {} }

  for (const districtDef of stateDef.districts) {
    const district = baseRecord({ name: districtDef.name, stateId: state.id })
    db.district.push(district)
    stateRefs[state.name].districts[district.name] = { id: district.id, talukas: {} }

    for (const talukaDef of districtDef.talukas) {
      const taluka = baseRecord({ name: talukaDef.name, districtId: district.id })
      db.taluka.push(taluka)
      stateRefs[state.name].districts[district.name].talukas[taluka.name] = { id: taluka.id, cities: {} }

      for (const cityName of talukaDef.cities) {
        const city = baseRecord({ name: cityName, talukaId: taluka.id })
        db.city.push(city)
        stateRefs[state.name].districts[district.name].talukas[taluka.name].cities[city.name] = city.id
      }
    }
  }
}

const mh = stateRefs.Maharashtra
const ka = stateRefs.Karnataka
const dl = stateRefs.Delhi
const puneDistrict = mh.districts.Pune
const haveliTaluka = puneDistrict.talukas.Haveli
const puneCityId = haveliTaluka.cities['Pune City']

// ---------- Demo users (one per role, memorable emails, one shared password) ----------
const DEMO_USERS = [
  { fullName: 'Super Admin', email: 'superadmin@hrpc.org', role: 'SUPER_ADMIN' },
  { fullName: 'National Admin', email: 'national.admin@hrpc.org', role: 'NATIONAL_ADMIN' },
  { fullName: 'State Admin - Maharashtra', email: 'state.admin@hrpc.org', role: 'STATE_ADMIN', stateId: mh.id },
  { fullName: 'District Admin - Pune', email: 'district.admin@hrpc.org', role: 'DISTRICT_ADMIN', stateId: mh.id, districtId: puneDistrict.id },
  { fullName: 'Taluka Admin - Haveli', email: 'taluka.admin@hrpc.org', role: 'TALUKA_ADMIN', stateId: mh.id, districtId: puneDistrict.id, talukaId: haveliTaluka.id },
  { fullName: 'City Admin - Pune City', email: 'city.admin@hrpc.org', role: 'CITY_ADMIN', stateId: mh.id, districtId: puneDistrict.id, talukaId: haveliTaluka.id, cityId: puneCityId },
  { fullName: 'Demo Volunteer', email: 'volunteer.demo@hrpc.org', role: 'VOLUNTEER' },
  { fullName: 'Demo Member', email: 'member.demo@hrpc.org', role: 'MEMBER' },
  { fullName: 'Demo Intern', email: 'intern.demo@hrpc.org', role: 'MEMBER' },
  { fullName: 'Anjali Verma', email: 'anjali.verma@example.com', role: 'MEMBER' },
]

const usersByRole = {}
const usersByEmail = {}
for (const u of DEMO_USERS) {
  const user = baseRecord({
    fullName: u.fullName,
    email: u.email,
    phone: '98765' + String(10000 + db.user.length).slice(-5),
    passwordHash,
    role: u.role,
    status: 'ACTIVE',
    stateId: u.stateId || null,
    districtId: u.districtId || null,
    talukaId: u.talukaId || null,
    cityId: u.cityId || null,
  })
  db.user.push(user)
  usersByRole[u.role] = usersByRole[u.role] || []
  usersByRole[u.role].push(user)
  usersByEmail[u.email] = user
}

const superAdmin = usersByRole.SUPER_ADMIN[0]
const nationalAdmin = usersByRole.NATIONAL_ADMIN[0]
const memberUser = usersByEmail['member.demo@hrpc.org']
const internUser = usersByEmail['intern.demo@hrpc.org']
const volunteerUser = usersByRole.VOLUNTEER[0]

// ---------- Member & Volunteer & Intern profiles ----------
db.member.push(
  baseRecord({
    userId: memberUser.id,
    membershipNumber: 'HRPC-2026-000001',
    membershipType: 'GENERAL',
    status: 'APPROVED',
    dateOfBirth: new Date('1990-05-14'),
    gender: 'FEMALE',
    occupation: 'Social Worker',
    address: '221 MG Road',
    state: 'Maharashtra',
    district: 'Pune',
    taluka: 'Haveli',
    city: 'Pune City',
    pincode: '411001',
    appliedAt: daysFromNow(-60),
    approvedAt: daysFromNow(-55),
    approvedById: superAdmin.id,
    joinDate: daysFromNow(-55),
    expiryDate: daysFromNow(310),
  })
)
db.member.push(
  baseRecord({
    userId: usersByEmail['anjali.verma@example.com'].id,
    membershipType: 'STUDENT',
    status: 'PENDING',
    occupation: 'Student',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    appliedAt: daysFromNow(-3),
  })
)

db.volunteer.push(
  baseRecord({
    userId: volunteerUser.id,
    skills: 'Community outreach, documentation, translation (Hindi/Marathi)',
    status: 'APPROVED',
    joinedAt: daysFromNow(-90),
    approvedById: superAdmin.id,
  })
)
const seededVolunteer = db.volunteer[0]
db.volunteerAttendance.push(
  baseRecord({ volunteerId: seededVolunteer.id, date: daysFromNow(-2), present: true, remarks: 'Attended awareness camp' }),
  baseRecord({ volunteerId: seededVolunteer.id, date: daysFromNow(-9), present: true, remarks: null })
)
db.volunteerTask.push(
  baseRecord({ volunteerId: seededVolunteer.id, title: 'Prepare RTI awareness handouts', description: 'For Pune camp', status: 'COMPLETED', dueDate: daysFromNow(-5) }),
  baseRecord({ volunteerId: seededVolunteer.id, title: 'Follow up with 3 complainants', description: null, status: 'PENDING', dueDate: daysFromNow(4) })
)

db.intern.push(
  baseRecord({
    userId: internUser.id,
    institution: 'ILS Law College, Pune',
    course: 'B.A. LL.B',
    mentorId: nationalAdmin.id,
    status: 'ONGOING',
    startDate: daysFromNow(-30),
    endDate: daysFromNow(60),
  })
)
const seededIntern = db.intern[0]
db.internAttendance.push(
  baseRecord({ internId: seededIntern.id, date: daysFromNow(-1), present: true }),
  baseRecord({ internId: seededIntern.id, date: daysFromNow(-2), present: true })
)
db.internDailyReport.push(
  baseRecord({ internId: seededIntern.id, date: daysFromNow(-1), report: 'Assisted with drafting case notes for two complaints and attended the legal-aid clinic.' })
)

// ---------- Complaints ----------
db.complaint.push(
  baseRecord({
    complaintNumber: 'HRPC-CMP-2026-000001',
    userId: memberUser.id,
    complainantName: 'Ramesh Kulkarni',
    complainantEmail: 'ramesh.kulkarni@example.com',
    complainantPhone: '9876500001',
    category: 'Police Misconduct',
    description: 'Alleged custodial mistreatment reported at the local police station. Case is under active investigation.',
    status: 'UNDER_INVESTIGATION',
    priority: 'HIGH',
    state: 'Maharashtra',
    district: 'Pune',
    incidentLocation: 'Haveli Police Station',
    incidentDate: daysFromNow(-20),
    assignedOfficerId: nationalAdmin.id,
  }),
  baseRecord({
    complaintNumber: 'HRPC-CMP-2026-000002',
    complainantName: 'Sunita Devi',
    complainantEmail: 'sunita.devi@example.com',
    complainantPhone: '9876500002',
    category: 'Workplace Discrimination',
    description: 'Discrimination based on caste reported at a private employer in Bengaluru.',
    status: 'REGISTERED',
    priority: 'MEDIUM',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  }),
  baseRecord({
    complaintNumber: 'HRPC-CMP-2026-000003',
    complainantName: 'Farhan Ali',
    complainantEmail: 'farhan.ali@example.com',
    complainantPhone: '9876500003',
    category: 'Child Rights Violation',
    description: 'Minor denied admission to a government school despite eligibility documents.',
    status: 'RESOLVED',
    priority: 'HIGH',
    state: 'Delhi',
    district: 'New Delhi',
    assignedOfficerId: superAdmin.id,
    resolutionSummary: 'School directed to admit the child; compliance confirmed by district education office.',
    resolvedAt: daysFromNow(-4),
  })
)
for (const c of db.complaint) {
  db.complaintNote.push(baseRecord({ complaintId: c.id, authorId: c.assignedOfficerId || superAdmin.id, note: 'Complaint registered.' }))
}
db.complaintNote.push(
  baseRecord({ complaintId: db.complaint[0].id, authorId: nationalAdmin.id, note: 'Assigned to investigating officer; site visit scheduled.' })
)
db.complaintNote.push(
  baseRecord({ complaintId: db.complaint[2].id, authorId: superAdmin.id, note: 'Resolved: school directed to admit the child.' })
)

// ---------- Campaigns & Donations ----------
const campaignSeed1 = baseRecord({
  title: 'Justice for Survivors Fund',
  slug: 'justice-for-survivors-fund',
  description: 'Crowdfunding campaign to support legal representation for survivors of human rights violations.',
  goalAmount: 500000,
  startDate: daysFromNow(-40),
  endDate: daysFromNow(50),
  status: 'ACTIVE',
  createdById: nationalAdmin.id,
})
db.campaign.push(campaignSeed1)
db.campaignUpdate.push(
  baseRecord({ campaignId: campaignSeed1.id, title: 'Halfway to our goal', content: 'Thanks to your support we have crossed 50% of our fundraising goal for this quarter.' })
)

db.donation.push(
  baseRecord({
    donorName: 'Anil Sharma',
    donorEmail: 'anil.sharma@example.com',
    amount: 5000,
    mode: 'ONLINE',
    status: 'SUCCESS',
    purpose: 'General Fund',
    receiptNumber: 'HRPC-DN-2026-000001',
    razorpayOrderId: 'dev_order_seed001',
    razorpayPaymentId: 'dev_pay_seed001',
    donatedAt: daysFromNow(-15),
  }),
  baseRecord({
    donorName: 'Priya Nair',
    donorEmail: 'priya.nair@example.com',
    amount: 1500,
    mode: 'OFFLINE',
    status: 'SUCCESS',
    purpose: 'Legal Aid Drive',
    receiptNumber: 'HRPC-DN-2026-000002',
    recordedById: nationalAdmin.id,
    donatedAt: daysFromNow(-10),
  }),
  baseRecord({
    donorName: 'Vikram Singh',
    donorEmail: 'vikram.singh@example.com',
    userId: memberUser.id,
    amount: 25000,
    mode: 'ONLINE',
    status: 'SUCCESS',
    purpose: 'Justice for Survivors Fund',
    campaignId: campaignSeed1.id,
    receiptNumber: 'HRPC-DN-2026-000003',
    razorpayOrderId: 'dev_order_seed003',
    razorpayPaymentId: 'dev_pay_seed003',
    isRecurring: true,
    recurringFrequency: 'MONTHLY',
    donatedAt: daysFromNow(-2),
  }),
  baseRecord({
    donorName: 'Deepa Iyer',
    donorEmail: 'deepa.iyer@example.com',
    amount: 2000,
    mode: 'ONLINE',
    status: 'PENDING',
    purpose: 'General Fund',
    razorpayOrderId: 'dev_order_seed004',
  })
)

// ---------- Beneficiaries ----------
db.beneficiary.push(
  baseRecord({
    beneficiaryCode: 'HRPC-BEN-2026-000001',
    fullName: 'Meena Kumari',
    email: 'meena.kumari@example.com',
    phone: '9876511001',
    complaintId: db.complaint[0].id,
    supportType: 'LEGAL',
    description: 'Provided free legal representation for custodial abuse case.',
    status: 'ASSISTANCE_PROVIDED',
    assistanceAmount: 8000,
    state: 'Maharashtra',
    district: 'Pune',
    recordedById: nationalAdmin.id,
  }),
  baseRecord({
    beneficiaryCode: 'HRPC-BEN-2026-000002',
    fullName: 'Farhan Ali',
    phone: '9876500003',
    complaintId: db.complaint[2].id,
    supportType: 'EDUCATION',
    description: 'School admission support for minor.',
    status: 'CLOSED',
    state: 'Delhi',
    district: 'New Delhi',
    recordedById: superAdmin.id,
  })
)

// ---------- Events ----------
const event1 = baseRecord({
  title: 'Human Rights Awareness Camp - Pune',
  description: "Community legal-literacy camp covering RTI, police accountability, and women's rights.",
  location: 'Pune, Maharashtra',
  startAt: daysFromNow(7),
  capacity: 150,
  status: 'UPCOMING',
  createdById: nationalAdmin.id,
})
const event2 = baseRecord({
  title: 'Free Legal Aid Clinic - Bengaluru',
  description: 'Volunteer advocates provide free consultations to underserved communities.',
  location: 'Bengaluru, Karnataka',
  startAt: daysFromNow(-14),
  endAt: daysFromNow(-13),
  status: 'COMPLETED',
  createdById: nationalAdmin.id,
})
db.event.push(event1, event2)
db.eventRegistration.push(
  baseRecord({ eventId: event2.id, userId: memberUser.id, attendeeName: memberUser.fullName, attendeeEmail: memberUser.email, attended: true, feedback: 'Very informative session.', rating: 5 }),
  baseRecord({ eventId: event2.id, attendeeName: 'Walk-in Attendee', attendeeEmail: 'walkin@example.com', attended: true }),
  baseRecord({ eventId: event1.id, userId: volunteerUser.id, attendeeName: volunteerUser.fullName, attendeeEmail: volunteerUser.email })
)

// ---------- Human Rights Links ----------
const HUMAN_RIGHTS_LINKS = [
  { title: 'National Human Rights Commission (NHRC) India', category: 'NATIONAL_COMMISSION', url: 'https://nhrc.nic.in', description: 'Apex statutory body for protection of human rights in India.' },
  { title: 'National Commission for Women', category: 'SPECIALIZED_COMMISSION', url: 'https://ncw.nic.in', description: "Statutory body for women's rights." },
  { title: 'National Commission for Protection of Child Rights', category: 'SPECIALIZED_COMMISSION', url: 'https://ncpcr.gov.in', description: 'Child rights protection commission.' },
  { title: 'National Commission for Scheduled Castes', category: 'SPECIALIZED_COMMISSION', url: 'https://ncsc.nic.in', description: 'Constitutional body safeguarding SC rights.' },
  { title: 'National Commission for Scheduled Tribes', category: 'SPECIALIZED_COMMISSION', url: 'https://ncst.nic.in', description: 'Constitutional body safeguarding ST rights.' },
  { title: 'National Commission for Minorities', category: 'SPECIALIZED_COMMISSION', url: 'https://ncm.nic.in', description: 'Safeguards rights of religious minorities.' },
  { title: 'National Legal Services Authority (NALSA)', category: 'LEGAL_SERVICES_AUTHORITY', url: 'https://nalsa.gov.in', description: 'Free legal aid to weaker sections.' },
  { title: 'Supreme Court of India', category: 'JUDICIARY', url: 'https://www.sci.gov.in', description: 'Apex judicial authority of India.' },
  { title: 'RTI Online Portal', category: 'GOVERNMENT_PORTAL', url: 'https://rtionline.gov.in', description: 'File Right to Information requests online.' },
  { title: 'National Cyber Crime Reporting Portal', category: 'GOVERNMENT_PORTAL', url: 'https://cybercrime.gov.in', description: 'Report cyber crimes including those against women/children.' },
  { title: 'Office of the UN High Commissioner for Human Rights (OHCHR)', category: 'INTERNATIONAL_BODY', url: 'https://www.ohchr.org', description: 'UN body promoting and protecting human rights globally.' },
  { title: 'UNICEF', category: 'INTERNATIONAL_BODY', url: 'https://www.unicef.org', description: "UN agency for children's rights and welfare." },
  { title: 'UNESCO', category: 'INTERNATIONAL_BODY', url: 'https://www.unesco.org', description: 'UN agency for education, science and culture.' },
  { title: 'UNDP', category: 'INTERNATIONAL_BODY', url: 'https://www.undp.org', description: 'UN Development Programme.' },
  { title: 'Amnesty International', category: 'INTERNATIONAL_BODY', url: 'https://www.amnesty.org', description: 'Global human rights advocacy organization.' },
  { title: 'International Committee of the Red Cross (ICRC)', category: 'INTERNATIONAL_BODY', url: 'https://www.icrc.org', description: 'Humanitarian protection and assistance for victims of conflict.' },
  { title: 'Asian Human Rights Commission', category: 'INTERNATIONAL_BODY', url: 'http://www.humanrights.asia', description: 'Regional human rights monitoring body for Asia.' },
  { title: 'Maharashtra State Human Rights Commission', category: 'STATE_COMMISSION', url: 'https://mshrc.maharashtra.gov.in', description: 'State human rights commission.', stateId: mh.id },
  { title: 'Karnataka State Human Rights Commission', category: 'STATE_COMMISSION', url: 'https://kshrc.karnataka.gov.in', description: 'State human rights commission.', stateId: ka.id },
  { title: 'Delhi Legal Services Authority', category: 'LEGAL_SERVICES_AUTHORITY', url: 'https://dlsa.delhi.gov.in', description: 'Free legal aid in Delhi.', stateId: dl.id },
]
HUMAN_RIGHTS_LINKS.forEach((link, i) => {
  db.humanRightsLink.push(
    baseRecord({
      title: link.title,
      category: link.category,
      url: link.url,
      description: link.description,
      stateId: link.stateId || null,
      isActive: true,
      sortOrder: i,
    })
  )
})

// ---------- System settings ----------
db.systemSetting.push(
  baseRecord({ key: 'ORG_NAME', value: 'Human Rights Protection Council' }),
  baseRecord({ key: 'SUPPORT_EMAIL', value: 'support@hrpc.org' }),
  baseRecord({ key: 'DEFAULT_CURRENCY', value: 'INR' })
)

// ---------- Notifications ----------
db.notification.push(
  baseRecord({ userId: memberUser.id, type: 'SUCCESS', title: 'Membership approved', message: 'Congratulations! Your membership (HRPC-2026-000001) has been approved.', link: '/dashboard/membership', isRead: false }),
  baseRecord({ userId: memberUser.id, type: 'INFO', title: 'Complaint status updated', message: 'Your complaint HRPC-CMP-2026-000001 is now "UNDER_INVESTIGATION".', link: `/dashboard/complaints/${db.complaint[0].id}`, isRead: false }),
  baseRecord({ userId: volunteerUser.id, type: 'SUCCESS', title: 'Volunteer application approved', message: 'You are now an approved HRPC volunteer. Welcome aboard!', link: '/dashboard/volunteer', isRead: true })
)

// ---------- Activity log ----------
db.activityLog.push(
  baseRecord({ userId: superAdmin.id, action: 'SEED', details: 'Demo dataset generated for MVP preview.' }),
  baseRecord({ userId: memberUser.id, action: 'LOGIN', details: null })
)

module.exports = {
  db,
  DEMO_PASSWORD,
  DEMO_USERS: DEMO_USERS.map((u) => ({ email: u.email, role: u.role })),
}
