const express = require('express');

const AnalyticsController = require('../controllers/analytics');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// POST route for creating a new analytics entry
router.post('', checkAuth, AnalyticsController.createAnalytics);

// PUT route for updating an existing analytics entry
router.put('/:id', checkAuth, AnalyticsController.updateAnalytics);

// GET route for fetching all analytics entries
router.get('', AnalyticsController.getAnalytics);

// GET route for fetching a single analytics entry by ID
router.get('/:id', AnalyticsController.getOneAnalytics);

// DELETE route for deleting an existing analytics entry by ID
router.delete('/:id', checkAuth, AnalyticsController.deleteAnalytics);

module.exports = router;
