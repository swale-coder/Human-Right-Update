const prisma = require('../config/prisma')

async function getDashboardSummary() {
  const [memberCount, approvedMembers, donationAgg, complaintCount, openComplaints, volunteerCount, internCount, eventCount] =
    await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'APPROVED' } }),
      prisma.donation.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true }, _count: true }),
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: { in: ['REGISTERED', 'UNDER_INVESTIGATION'] } } }),
      prisma.volunteer.count({ where: { status: 'APPROVED' } }),
      prisma.intern.count({ where: { status: { in: ['APPROVED', 'ONGOING'] } } }),
      prisma.event.count({ where: { status: { in: ['UPCOMING', 'ONGOING'] } } }),
    ])

  return {
    members: { total: memberCount, approved: approvedMembers },
    donations: { totalAmount: donationAgg._sum.amount || 0, totalCount: donationAgg._count },
    complaints: { total: complaintCount, open: openComplaints },
    volunteers: { active: volunteerCount },
    interns: { active: internCount },
    events: { upcoming: eventCount },
  }
}

async function getModuleRows(module) {
  switch (module) {
    case 'members':
      return prisma.member.findMany({ include: { user: { select: { fullName: true, email: true, phone: true } } } })
    case 'donations':
      return prisma.donation.findMany()
    case 'complaints':
      return prisma.complaint.findMany()
    case 'volunteers':
      return prisma.volunteer.findMany({ include: { user: { select: { fullName: true, email: true, phone: true } } } })
    case 'interns':
      return prisma.intern.findMany({ include: { user: { select: { fullName: true, email: true, phone: true } } } })
    case 'events':
      return prisma.event.findMany({ include: { _count: { select: { registrations: true } } } })
    case 'beneficiaries':
      return prisma.beneficiary.findMany()
    default:
      return []
  }
}

module.exports = { getDashboardSummary, getModuleRows }
