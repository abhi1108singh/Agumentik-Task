const ticketQueueService = require('../services/TicketQueueService');

class TicketController {
  // Create a new ticket
  createTicket(req, res) {
    try {
      const { type } = req.body;

      if (!type || !['billing', 'technical'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket type. Must be "billing" or "technical"'
        });
      }

      const ticket = ticketQueueService.addTicket(type);
      const position = ticketQueueService.getQueuePosition(ticket.id);

      res.status(201).json({
        success: true,
        data: {
          ...ticket.toJSON(),
          queuePosition: position
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating ticket',
        error: error.message
      });
    }
  }

  // Get a specific ticket
  getTicket(req, res) {
    try {
      const { ticketId } = req.params;
      const ticket = ticketQueueService.getTicket(ticketId);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      const position = ticketQueueService.getQueuePosition(ticketId);

      res.status(200).json({
        success: true,
        data: {
          ...ticket.toJSON(),
          queuePosition: position
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching ticket',
        error: error.message
      });
    }
  }

  // Get entire queue
  getQueue(req, res) {
    try {
      const queue = ticketQueueService.getQueue();

      res.status(200).json({
        success: true,
        data: queue,
        count: queue.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching queue',
        error: error.message
      });
    }
  }

  // Get queue statistics
  getQueueStats(req, res) {
    try {
      const stats = ticketQueueService.getQueueStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching queue stats',
        error: error.message
      });
    }
  }

  // Start processing a ticket
  startProcessing(req, res) {
    try {
      const { ticketId } = req.params;
      const ticket = ticketQueueService.startProcessing(ticketId);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      res.status(200).json({
        success: true,
        data: ticket.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error starting processing',
        error: error.message
      });
    }
  }

  // Resolve a ticket
  resolveTicket(req, res) {
    try {
      const { ticketId } = req.params;
      const ticket = ticketQueueService.resolveTicket(ticketId);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Ticket resolved',
        data: ticket.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error resolving ticket',
        error: error.message
      });
    }
  }
}

module.exports = new TicketController();
