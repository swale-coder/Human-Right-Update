// ---------------------------------------------------------------------------
// In-memory "schema" metadata describing relations & unique constraints for
// every model in prisma/schema.prisma. This drives the generic mock Prisma
// client in ./client.js so that services never have to know the database
// underneath is not a real one.
// ---------------------------------------------------------------------------

// relation.type: 'belongsTo' (foreign key lives on THIS model) |
//                'hasOne'    (foreign key lives on the OTHER model, 0/1) |
//                'hasMany'   (foreign key lives on the OTHER model, many)
const SCHEMA = {
  user: {
    unique: ['email'],
    relations: {
      state: { type: 'belongsTo', model: 'state', fk: 'stateId' },
      district: { type: 'belongsTo', model: 'district', fk: 'districtId' },
      taluka: { type: 'belongsTo', model: 'taluka', fk: 'talukaId' },
      city: { type: 'belongsTo', model: 'city', fk: 'cityId' },
      member: { type: 'hasOne', model: 'member', fk: 'userId' },
      donations: { type: 'hasMany', model: 'donation', fk: 'userId' },
      complaintsFiled: { type: 'hasMany', model: 'complaint', fk: 'userId' },
      complaintsAssigned: { type: 'hasMany', model: 'complaint', fk: 'assignedOfficerId' },
      volunteer: { type: 'hasOne', model: 'volunteer', fk: 'userId' },
      intern: { type: 'hasOne', model: 'intern', fk: 'userId' },
      notifications: { type: 'hasMany', model: 'notification', fk: 'userId' },
      refreshTokens: { type: 'hasMany', model: 'refreshToken', fk: 'userId' },
      passwordResets: { type: 'hasMany', model: 'passwordReset', fk: 'userId' },
      activityLogs: { type: 'hasMany', model: 'activityLog', fk: 'userId' },
    },
  },
  refreshToken: {
    unique: ['token'],
    relations: { user: { type: 'belongsTo', model: 'user', fk: 'userId' } },
  },
  passwordReset: {
    unique: ['token'],
    relations: { user: { type: 'belongsTo', model: 'user', fk: 'userId' } },
  },
  activityLog: {
    unique: [],
    relations: { user: { type: 'belongsTo', model: 'user', fk: 'userId' } },
  },
  state: {
    unique: ['name', 'code'],
    relations: {
      districts: { type: 'hasMany', model: 'district', fk: 'stateId' },
      users: { type: 'hasMany', model: 'user', fk: 'stateId' },
      humanRightsLinks: { type: 'hasMany', model: 'humanRightsLink', fk: 'stateId' },
    },
  },
  district: {
    unique: [],
    relations: {
      state: { type: 'belongsTo', model: 'state', fk: 'stateId' },
      talukas: { type: 'hasMany', model: 'taluka', fk: 'districtId' },
    },
  },
  taluka: {
    unique: [],
    relations: {
      district: { type: 'belongsTo', model: 'district', fk: 'districtId' },
      cities: { type: 'hasMany', model: 'city', fk: 'talukaId' },
    },
  },
  city: {
    unique: [],
    relations: { taluka: { type: 'belongsTo', model: 'taluka', fk: 'talukaId' } },
  },
  member: {
    unique: ['userId', 'membershipNumber'],
    relations: { user: { type: 'belongsTo', model: 'user', fk: 'userId' } },
  },
  donation: {
    unique: ['receiptNumber', 'razorpayOrderId'],
    relations: {
      user: { type: 'belongsTo', model: 'user', fk: 'userId' },
      campaign: { type: 'belongsTo', model: 'campaign', fk: 'campaignId' },
    },
  },
  complaint: {
    unique: ['complaintNumber'],
    relations: {
      user: { type: 'belongsTo', model: 'user', fk: 'userId' },
      assignedOfficer: { type: 'belongsTo', model: 'user', fk: 'assignedOfficerId' },
      evidences: { type: 'hasMany', model: 'complaintEvidence', fk: 'complaintId' },
      notes: { type: 'hasMany', model: 'complaintNote', fk: 'complaintId' },
    },
  },
  complaintEvidence: {
    unique: [],
    relations: { complaint: { type: 'belongsTo', model: 'complaint', fk: 'complaintId' } },
  },
  complaintNote: {
    unique: [],
    relations: { complaint: { type: 'belongsTo', model: 'complaint', fk: 'complaintId' } },
  },
  beneficiary: {
    unique: ['beneficiaryCode'],
    relations: {},
  },
  volunteer: {
    unique: ['userId'],
    relations: {
      user: { type: 'belongsTo', model: 'user', fk: 'userId' },
      attendances: { type: 'hasMany', model: 'volunteerAttendance', fk: 'volunteerId' },
      tasks: { type: 'hasMany', model: 'volunteerTask', fk: 'volunteerId' },
    },
  },
  volunteerAttendance: {
    unique: [],
    relations: { volunteer: { type: 'belongsTo', model: 'volunteer', fk: 'volunteerId' } },
  },
  volunteerTask: {
    unique: [],
    relations: { volunteer: { type: 'belongsTo', model: 'volunteer', fk: 'volunteerId' } },
  },
  intern: {
    unique: ['userId'],
    relations: {
      user: { type: 'belongsTo', model: 'user', fk: 'userId' },
      attendances: { type: 'hasMany', model: 'internAttendance', fk: 'internId' },
      reports: { type: 'hasMany', model: 'internDailyReport', fk: 'internId' },
    },
  },
  internAttendance: {
    unique: [],
    relations: { intern: { type: 'belongsTo', model: 'intern', fk: 'internId' } },
  },
  internDailyReport: {
    unique: [],
    relations: { intern: { type: 'belongsTo', model: 'intern', fk: 'internId' } },
  },
  event: {
    unique: [],
    relations: { registrations: { type: 'hasMany', model: 'eventRegistration', fk: 'eventId' } },
  },
  eventRegistration: {
    unique: [],
    relations: { event: { type: 'belongsTo', model: 'event', fk: 'eventId' } },
  },
  campaign: {
    unique: ['slug'],
    relations: {
      updates: { type: 'hasMany', model: 'campaignUpdate', fk: 'campaignId' },
      donations: { type: 'hasMany', model: 'donation', fk: 'campaignId' },
    },
  },
  campaignUpdate: {
    unique: [],
    relations: { campaign: { type: 'belongsTo', model: 'campaign', fk: 'campaignId' } },
  },
  systemSetting: {
    unique: ['key'],
    relations: {},
  },
  humanRightsLink: {
    unique: [],
    relations: { state: { type: 'belongsTo', model: 'state', fk: 'stateId' } },
  },
  notification: {
    unique: [],
    relations: { user: { type: 'belongsTo', model: 'user', fk: 'userId' } },
  },
}

// Cascade / set-null rules applied on delete (mirrors onDelete in schema.prisma)
const CASCADE_RULES = {
  user: [
    { model: 'refreshToken', fk: 'userId', action: 'cascade' },
    { model: 'passwordReset', fk: 'userId', action: 'cascade' },
    { model: 'member', fk: 'userId', action: 'cascade' },
    { model: 'volunteer', fk: 'userId', action: 'cascade' },
    { model: 'intern', fk: 'userId', action: 'cascade' },
    { model: 'activityLog', fk: 'userId', action: 'setNull' },
    { model: 'donation', fk: 'userId', action: 'setNull' },
    { model: 'complaint', fk: 'userId', action: 'setNull' },
    { model: 'complaint', fk: 'assignedOfficerId', action: 'setNull' },
    { model: 'notification', fk: 'userId', action: 'cascade' },
  ],
  complaint: [
    { model: 'complaintEvidence', fk: 'complaintId', action: 'cascade' },
    { model: 'complaintNote', fk: 'complaintId', action: 'cascade' },
  ],
  volunteer: [
    { model: 'volunteerAttendance', fk: 'volunteerId', action: 'cascade' },
    { model: 'volunteerTask', fk: 'volunteerId', action: 'cascade' },
  ],
  intern: [
    { model: 'internAttendance', fk: 'internId', action: 'cascade' },
    { model: 'internDailyReport', fk: 'internId', action: 'cascade' },
  ],
  event: [{ model: 'eventRegistration', fk: 'eventId', action: 'cascade' }],
  campaign: [
    { model: 'campaignUpdate', fk: 'campaignId', action: 'cascade' },
    { model: 'donation', fk: 'campaignId', action: 'setNull' },
  ],
  state: [
    { model: 'district', fk: 'stateId', action: 'cascade' },
    { model: 'humanRightsLink', fk: 'stateId', action: 'setNull' },
  ],
  district: [{ model: 'taluka', fk: 'districtId', action: 'cascade' }],
  taluka: [{ model: 'city', fk: 'talukaId', action: 'cascade' }],
}

// Sensible field defaults applied when not supplied in `data` on create()
const DEFAULTS = {
  user: { phone: null, status: 'ACTIVE', role: 'MEMBER', stateId: null, districtId: null, talukaId: null, cityId: null },
  refreshToken: { revoked: false },
  passwordReset: { used: false },
  activityLog: { userId: null, details: null, ipAddress: null },
  member: { membershipType: 'GENERAL', status: 'PENDING' },
  donation: { currency: 'INR', status: 'PENDING', isRecurring: false, recurringFrequency: 'NONE', userId: null, campaignId: null },
  complaint: { status: 'REGISTERED', priority: 'MEDIUM', userId: null, assignedOfficerId: null },
  beneficiary: { status: 'REGISTERED' },
  volunteer: { status: 'PENDING' },
  volunteerTask: { status: 'PENDING' },
  intern: { status: 'PENDING' },
  event: { status: 'UPCOMING' },
  eventRegistration: { attended: false, userId: null },
  campaign: { status: 'ACTIVE', startDate: () => new Date() },
  humanRightsLink: { isActive: true, sortOrder: 0, stateId: null },
  notification: { type: 'INFO', isRead: false, link: null },
  volunteerAttendance: { present: true, remarks: null },
  internAttendance: { present: true },
}

module.exports = { SCHEMA, CASCADE_RULES, DEFAULTS }
