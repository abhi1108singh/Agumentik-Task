const Ticket = require('../models/Ticket');

class TicketQueueService {
  constructor() {
    this.queue = [];
    this.updateInterval = null;
    this.startPriorityUpdate();
  }

  // Add a new ticket to the queue
  addTicket(type) {
    const ticket = new Ticket(type);
    this.queue.push(ticket);
    this.sortQueue();
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
          ticket.calculatePriority();
        }
      });
      this.sortQueue();
    }, 60000); // Update every minute
  }

  // Get ticket by ID
  getTicket(ticketId) {
    return this.queue.find(t => t.id === ticketId);
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

  // Move ticket to in-progress status
  startProcessing(ticketId) {
    const ticket = this.getTicket(ticketId);
    if (ticket) {
      ticket.status = 'in-progress';
      return ticket;
    }
    return null;
  }

  // Resolve a ticket
  resolveTicket(ticketId) {
    const ticket = this.getTicket(ticketId);
    if (ticket) {
      ticket.status = 'resolved';
      this.queue = this.queue.filter(t => t.id !== ticketId);
      return ticket;
    }
    return null;
  }

  // Get queue statistics
  getQueueStats() {
    return {
      totalTickets: this.queue.length,
      waitingTickets: this.queue.filter(t => t.status === 'waiting').length,
      billingTickets: this.queue.filter(t => t.type === 'billing').length,
      technicalTickets: this.queue.filter(t => t.type === 'technical').length,
      averageWaitTime: this.calculateAverageWaitTime()
    };
  }

  calculateAverageWaitTime() {
    if (this.queue.length === 0) return 0;
    const totalWaitTime = this.queue.reduce((sum, ticket) => {
      return sum + (Date.now() - ticket.createdAt);
    }, 0);
    return Math.floor(totalWaitTime / this.queue.length / 60000); // in minutes
  }

  // Cleanup on service stop
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

module.exports = new TicketQueueService();
