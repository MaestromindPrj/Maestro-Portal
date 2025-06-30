const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  updateReportStatus,
  updateReport,
  deleteReport
} = require('../controllers/reportController');

router.post('/', createReport);
router.get('/', getReports);
router.put('/status/:id', updateReportStatus);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);

module.exports = router;
