const ticketQueueService = require('../services/TicketQueueService');

class TicketController {
  // Create a new ticket
  createTicket(req, res) {
    try {
      const { type, notes } = req.body;

      if (!type || !['billing', 'technical'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket type. Must be "billing" or "technical"'
        });
      }

      const ticket = ticketQueueService.addTicket(type, notes || '');
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

  // Get ticket history
  getTicketHistory(req, res) {
    try {
      const { ticketId } = req.params;
      const history = ticketQueueService.getTicketHistory(ticketId);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching ticket history',
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

  // Get resolved tickets
  getResolvedTickets(req, res) {
    try {
      const limit = req.query.limit || 100;
      const resolved = ticketQueueService.getResolvedTickets(limit);

      res.status(200).json({
        success: true,
        data: resolved,
        count: resolved.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching resolved tickets',
        error: error.message
      });
    }
  }

  // Filter tickets
  filterTickets(req, res) {
    try {
      const filters = req.query;
      const filtered = ticketQueueService.filterTickets(filters);

      res.status(200).json({
        success: true,
        data: filtered,
        count: filtered.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error filtering tickets',
        error: error.message
      });
    }
  }

  // Search tickets
  searchTickets(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search term required'
        });
      }

      const results = ticketQueueService.searchTickets(q);

      res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching tickets',
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

  // Get analytics summary
  getAnalyticsSummary(req, res) {
    try {
      const summary = ticketQueueService.getAnalyticsSummary();

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics',
        error: error.message
      });
    }
  }

  // Get displacement analysis
  getDisplacementAnalysis(req, res) {
    try {
      const analysis = ticketQueueService.getDisplacementAnalysis();

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching displacement analysis',
        error: error.message
      });
    }
  }

  // Get wait time analysis
  getWaitTimeAnalysis(req, res) {
    try {
      const analysis = ticketQueueService.getWaitTimeAnalysis();

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching wait time analysis',
        error: error.message
      });
    }
  }

  // Start processing a ticket
  startProcessing(req, res) {
    try {
      const { ticketId } = req.params;
      const { agentId } = req.body;
      const ticket = ticketQueueService.startProcessing(ticketId, agentId);

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
      const { resolutionNotes, satisfaction } = req.body;
      const ticket = ticketQueueService.resolveTicket(ticketId, resolutionNotes, satisfaction);

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

  // Add comment to ticket
  addComment(req, res) {
    try {
      const { ticketId } = req.params;
      const { author, message } = req.body;

      if (!author || !message) {
        return res.status(400).json({
          success: false,
          message: 'Author and message required'
        });
      }

      const ticket = ticketQueueService.addComment(ticketId, author, message);

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
        message: 'Error adding comment',
        error: error.message
      });
    }
  }

  // Add tags to ticket
  addTags(req, res) {
    try {
      const { ticketId } = req.params;
      const { tags } = req.body;

      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: 'Tags must be an array'
        });
      }

      const ticket = ticketQueueService.addTags(ticketId, tags);

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
        message: 'Error adding tags',
        error: error.message
      });
    }
  }
}

module.exports = new TicketController();
