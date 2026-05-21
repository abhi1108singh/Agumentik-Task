const express = require('express');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

// Ticket routes
router.post('/tickets', ticketController.createTicket.bind(ticketController));
router.get('/tickets', ticketController.getQueue.bind(ticketController));
router.get('/tickets/:ticketId', ticketController.getTicket.bind(ticketController));
router.post('/tickets/:ticketId/process', ticketController.startProcessing.bind(ticketController));
router.post('/tickets/:ticketId/resolve', ticketController.resolveTicket.bind(ticketController));
router.get('/stats', ticketController.getQueueStats.bind(ticketController));

module.exports = router;
