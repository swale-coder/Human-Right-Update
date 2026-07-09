const { body, query } = require('express-validator')

const registerComplaintValidator = [
  body('complainantName').trim().notEmpty().withMessage('Name is required'),
  body('complainantEmail').optional().isEmail().withMessage('Invalid email'),
  body('complainantPhone').optional().trim(),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('state').optional().trim(),
  body('district').optional().trim(),
  body('taluka').optional().trim(),
  body('city').optional().trim(),
  body('incidentLocation').optional().trim(),
  body('incidentDate').optional().isISO8601(),
]

const updateComplaintValidator = [
  body('status')
    .optional()
    .isIn(['REGISTERED', 'UNDER_INVESTIGATION', 'RESOLVED', 'REJECTED', 'CLOSED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('category').optional().trim(),
  body('assignedOfficerId').optional().trim(),
  body('assignedAdvocateName').optional().trim(),
]

const resolveComplaintValidator = [
  body('resolutionSummary').trim().notEmpty().withMessage('Resolution summary is required'),
]

const addNoteValidator = [body('note').trim().notEmpty().withMessage('Note is required')]

const listComplaintsValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status')
    .optional()
    .isIn(['REGISTERED', 'UNDER_INVESTIGATION', 'RESOLVED', 'REJECTED', 'CLOSED']),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
]

module.exports = {
  registerComplaintValidator,
  updateComplaintValidator,
  resolveComplaintValidator,
  addNoteValidator,
  listComplaintsValidator,
}
