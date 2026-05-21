const express = require('express');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

// Ticket management routes
router.post('/tickets', ticketController.createTicket.bind(ticketController));
router.get('/tickets', ticketController.getQueue.bind(ticketController));
router.get('/tickets/search', ticketController.searchTickets.bind(ticketController));
router.get('/tickets/filter', ticketController.filterTickets.bind(ticketController));
router.get('/tickets/resolved', ticketController.getResolvedTickets.bind(ticketController));
router.get('/tickets/:ticketId', ticketController.getTicket.bind(ticketController));
router.get('/tickets/:ticketId/history', ticketController.getTicketHistory.bind(ticketController));
router.post('/tickets/:ticketId/process', ticketController.startProcessing.bind(ticketController));
router.post('/tickets/:ticketId/resolve', ticketController.resolveTicket.bind(ticketController));
router.post('/tickets/:ticketId/comments', ticketController.addComment.bind(ticketController));
router.post('/tickets/:ticketId/tags', ticketController.addTags.bind(ticketController));

// Statistics and analytics routes
router.get('/stats', ticketController.getQueueStats.bind(ticketController));
router.get('/analytics/summary', ticketController.getAnalyticsSummary.bind(ticketController));
router.get('/analytics/displacement', ticketController.getDisplacementAnalysis.bind(ticketController));
router.get('/analytics/wait-time', ticketController.getWaitTimeAnalysis.bind(ticketController));

module.exports = router;
