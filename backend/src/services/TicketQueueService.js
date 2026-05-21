const Ticket = require('../models/Ticket');
const analyticsService = require('./AnalyticsService');

class TicketQueueService {
  constructor() {
    this.queue = [];
    this.resolvedTickets = [];
    this.updateInterval = null;
    this.startPriorityUpdate();
  }

  // Add a new ticket to the queue
  addTicket(type, notes = '') {
    const ticket = new Ticket(type, notes);
    this.queue.push(ticket);
    this.sortQueue();
    analyticsService.logAction(ticket.id, 'created', { type, notes });
    return ticket;
  }

  // Sort queue by priority (higher first), then by creation time (earlier first)
  sortQueue() {
    this.queue.sort((a, b) => {
      if (b.currentPriority !== a.currentPriority) {
        return b.currentPriority - a.currentPriority;
      }
      // If priorities are equal, earlier ticket comes first
      return a.createdAt - b.createdAt;
    });
  }

  // Update priorities for all tickets every minute
  startPriorityUpdate() {
    this.updateInterval = setInterval(() => {
      this.queue.forEach(ticket => {
        if (ticket.status === 'waiting') {
          const oldPriority = ticket.currentPriority;
          ticket.calculatePriority();
          if (oldPriority !== ticket.currentPriority) {
            analyticsService.logAction(ticket.id, 'priority_updated', {
              oldPriority,
              newPriority: ticket.currentPriority
            });
          }
        }
      });
      this.sortQueue();
    }, 60000); // Update every minute
  }

  // Get ticket by ID
  getTicket(ticketId) {
    return this.queue.find(t => t.id === ticketId);
  }

  // Get resolved ticket by ID
  getResolvedTicket(ticketId) {
    return this.resolvedTickets.find(t => t.id === ticketId);
  }

  // Get queue position of a ticket
  getQueuePosition(ticketId) {
    const index = this.queue.findIndex(t => t.id === ticketId);
    return index !== -1 ? index + 1 : null;
  }

  // Get entire queue
  getQueue() {
    return this.queue.map((ticket, index) => ({
      ...ticket.toJSON(),
      queuePosition: index + 1
    }));
  }

  // Get resolved tickets
  getResolvedTickets(limit = 100) {
    return this.resolvedTickets
      .sort((a, b) => b.resolvedAt - a.resolvedAt)
      .slice(0, limit)
      .map(ticket => ticket.toJSON());
  }

  // Move ticket to in-progress status
  startProcessing(ticketId, agentId = null) {
    const ticket = this.getTicket(ticketId);
    if (ticket) {
      ticket.status = 'in-progress';
      if (agentId) {
        ticket.assign(agentId);
      }
      analyticsService.logAction(ticketId, 'status_changed', {
        oldStatus: 'waiting',
        newStatus: 'in-progress',
        agentId
      });
      return ticket;
    }
    return null;
  }

  // Resolve a ticket
  resolveTicket(ticketId, resolutionNotes = '', satisfaction = null) {
    const ticket = this.getTicket(ticketId);
    if (ticket) {
      ticket.resolve(resolutionNotes);
      if (satisfaction) {
        ticket.setSatisfaction(satisfaction);
      }
      this.queue = this.queue.filter(t => t.id !== ticketId);
      this.resolvedTickets.push(ticket);
      analyticsService.logAction(ticketId, 'resolved', {
        resolutionTime: ticket.resolutionTime,
        satisfaction
      });
      return ticket;
    }
    return null;
  }

  // Add comment to ticket
  addComment(ticketId, author, message) {
    const ticket = this.getTicket(ticketId) || this.getResolvedTicket(ticketId);
    if (ticket) {
      ticket.addComment(author, message);
      analyticsService.logAction(ticketId, 'comment_added', { author, message });
      return ticket;
    }
    return null;
  }

  // Add tags to ticket
  addTags(ticketId, tags) {
    const ticket = this.getTicket(ticketId);
    if (ticket) {
      tags.forEach(tag => ticket.addTag(tag));
      analyticsService.logAction(ticketId, 'tags_added', { tags });
      return ticket;
    }
    return null;
  }

  // Get queue statistics
  getQueueStats() {
    return {
      totalTickets: this.queue.length,
      waitingTickets: this.queue.filter(t => t.status === 'waiting').length,
      inProgressTickets: this.queue.filter(t => t.status === 'in-progress').length,
      billingTickets: this.queue.filter(t => t.type === 'billing').length,
      technicalTickets: this.queue.filter(t => t.type === 'technical').length,
      averageWaitTime: this.calculateAverageWaitTime(),
      resolvedTicketsCount: this.resolvedTickets.length
    };
  }

  calculateAverageWaitTime() {
    if (this.queue.length === 0) return 0;
    const totalWaitTime = this.queue.reduce((sum, ticket) => {
      return sum + (Date.now() - ticket.createdAt);
    }, 0);
    return Math.floor(totalWaitTime / this.queue.length / 60000); // in minutes
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return analyticsService.getAnalyticsSummary(this.queue);
  }

  // Get ticket history
  getTicketHistory(ticketId) {
    return analyticsService.getTicketHistory(ticketId);
  }

  // Get displacement analysis
  getDisplacementAnalysis() {
    return analyticsService.getDisplacementAnalysis(this.queue);
  }

  // Get wait time analysis
  getWaitTimeAnalysis() {
    return analyticsService.getWaitTimeAnalysis(this.queue);
  }

  // Get tickets by filter
  filterTickets(filters = {}) {
    let filtered = this.queue;

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.minPriority) {
      filtered = filtered.filter(t => t.currentPriority >= filters.minPriority);
    }

    if (filters.maxPriority) {
      filtered = filtered.filter(t => t.currentPriority <= filters.maxPriority);
    }

    if (filters.tag) {
      filtered = filtered.filter(t => t.tags.includes(filters.tag));
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(t => t.assignedTo === filters.assignedTo);
    }

    return filtered.map((ticket, index) => ({
      ...ticket.toJSON(),
      queuePosition: this.queue.indexOf(ticket) + 1
    }));
  }

  // Search tickets
  searchTickets(searchTerm) {
    return this.queue
      .filter(ticket => 
        ticket.id.includes(searchTerm) ||
        ticket.notes.includes(searchTerm) ||
        ticket.tags.some(tag => tag.includes(searchTerm))
      )
      .map((ticket, index) => ({
        ...ticket.toJSON(),
        queuePosition: this.queue.indexOf(ticket) + 1
      }));
  }

  // Cleanup on service stop
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

module.exports = new TicketQueueService();
